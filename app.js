"use strict";

/* ===== Storage keys ===== */
const USERS_KEY = "pc_users";
const SESSION_KEY = "pc_session";
const itemsKey = (email) => "pc_items_" + email;

/* ===== Small helpers ===== */
const $ = (id) => document.getElementById(id);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function money(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

/* ===== State ===== */
let currentUser = null; // { name, email }
let items = [];

/* ===== Auth (simulated, localStorage only) ===== */
let mode = "login";

function setMode(newMode) {
  mode = newMode;
  $("tab-login").classList.toggle("active", mode === "login");
  $("tab-signup").classList.toggle("active", mode === "signup");
  $("name-field").classList.toggle("hidden", mode === "login");
  $("auth-submit").textContent = mode === "login" ? "Login" : "Create Account";
  $("auth-error").textContent = "";
}

$("tab-login").addEventListener("click", () => setMode("login"));
$("tab-signup").addEventListener("click", () => setMode("signup"));

$("auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("auth-name").value.trim();
  const email = $("auth-email").value.trim().toLowerCase();
  const password = $("auth-password").value;
  const err = $("auth-error");

  if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = "Please enter a valid email."; return; }
  if (password.length < 6) { err.textContent = "Password must be at least 6 characters."; return; }

  const users = load(USERS_KEY, []);

  if (mode === "signup") {
    if (!name) { err.textContent = "Name is required."; return; }
    if (users.some((u) => u.email === email)) { err.textContent = "This email is already registered."; return; }
    // NOTE: simulation only. Real apps must hash passwords on a server.
    users.push({ name, email, password });
    save(USERS_KEY, users);
    startSession({ name, email });
  } else {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) { err.textContent = "Incorrect email or password."; return; }
    startSession({ name: user.name, email: user.email });
  }
});

function startSession(user) {
  currentUser = user;
  save(SESSION_KEY, user);
  items = load(itemsKey(user.email), null);
  if (items === null) {
    items = seedItems();
    persist();
  }
  $("auth-form").reset();
  $("auth-error").textContent = "";
  showApp();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  items = [];
  $("app-section").classList.add("hidden");
  $("auth-section").classList.remove("hidden");
  setMode("login");
}
$("logout-btn").addEventListener("click", logout);

function seedItems() {
  const now = Date.now();
  return [
    { id: now + 1, name: "Wireless Mouse", category: "Electronics", price: 599, stock: 14, desc: "2.4GHz silent-click mouse." },
    { id: now + 2, name: "JavaScript Handbook", category: "Books", price: 349, stock: 3, desc: "Beginner to advanced JS guide." },
    { id: now + 3, name: "Cotton T-Shirt", category: "Clothing", price: 399, stock: 25, desc: "Comfortable everyday wear." },
  ];
}

/* ===== App view ===== */
function showApp() {
  $("auth-section").classList.add("hidden");
  $("app-section").classList.remove("hidden");
  $("user-name").textContent = "Hi, " + currentUser.name;
  render();
}

function persist() {
  save(itemsKey(currentUser.email), items);
}

function render() {
  renderCategoryFilter();
  renderStats();
  renderGrid();
}

function renderCategoryFilter() {
  const select = $("filter-category");
  const previous = select.value || "all";
  const cats = [...new Set(items.map((i) => i.category))].sort();
  select.innerHTML =
    '<option value="all">All categories</option>' +
    cats.map(function (c) { return '<option value="' + escapeHTML(c) + '">' + escapeHTML(c) + '</option>'; }).join("");
  select.value = cats.includes(previous) ? previous : "all";
}

function renderStats() {
  $("stat-total").textContent = items.length;
  $("stat-value").textContent = money(items.reduce((sum, i) => sum + i.price * i.stock, 0));
  $("stat-low").textContent = items.filter((i) => i.stock < 5).length;
}

function visibleItems() {
  const q = $("search").value.trim().toLowerCase();
  const cat = $("filter-category").value;
  const sort = $("sort").value;

  let list = items.filter(
    (i) => i.name.toLowerCase().includes(q) && (cat === "all" || i.category === cat)
  );

  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.id - a.id);
  return list;
}

function renderGrid() {
  const list = visibleItems();
  $("empty").classList.toggle("hidden", list.length > 0);
  $("grid").innerHTML = list
    .map(
      (i) => `
      <article class="card item">
        <span class="badge">${escapeHTML(i.category)}</span>
        <h4>${escapeHTML(i.name)}</h4>
        <p>${escapeHTML(i.desc || "No description")}</p>
        <div class="price">${money(i.price)}</div>
        <div class="stock ${i.stock < 5 ? "low" : ""}">
          ${i.stock < 5 ? "⚠️ Low stock: " : "In stock: "}${i.stock}
        </div>
        <div class="item-actions">
          <button class="btn ghost small" data-action="edit" data-id="${i.id}">Edit</button>
          <button class="btn danger small" data-action="delete" data-id="${i.id}">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

["search", "filter-category", "sort"].forEach((id) => {
  $(id).addEventListener("input", renderGrid);
});

/* ===== CRUD ===== */
$("grid").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "edit") openModal(id);
  if (btn.dataset.action === "delete") deleteItem(id);
});

function openModal(id) {
  $("item-error").textContent = "";
  $("item-form").reset();
  $("item-id").value = "";
  $("modal-title").textContent = "Add Item";

  if (id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    $("modal-title").textContent = "Edit Item";
    $("item-id").value = item.id;
    $("item-name").value = item.name;
    $("item-category").value = item.category;
    $("item-price").value = item.price;
    $("item-stock").value = item.stock;
    $("item-desc").value = item.desc || "";
  }
  $("modal").classList.remove("hidden");
  $("item-name").focus();
}

function closeModal() {
  $("modal").classList.add("hidden");
}

$("add-btn").addEventListener("click", () => openModal());
$("cancel-btn").addEventListener("click", closeModal);
$("modal").addEventListener("click", (e) => { if (e.target === $("modal")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

$("item-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("item-name").value.trim();
  const price = Number($("item-price").value);
  const stock = Number($("item-stock").value);
  const err = $("item-error");

  if (!name) { err.textContent = "Item name is required."; return; }
  if ($("item-price").value === "" || price < 0) { err.textContent = "Please enter a valid price."; return; }
  if ($("item-stock").value === "" || stock < 0 || !Number.isInteger(stock)) { err.textContent = "Stock must be a whole number."; return; }

  const data = {
    name,
    category: $("item-category").value,
    price,
    stock,
    desc: $("item-desc").value.trim(),
  };

  const editId = Number($("item-id").value);
  if (editId) {
    items = items.map((i) => (i.id === editId ? { ...i, ...data } : i)); // UPDATE
  } else {
    items.push({ id: Date.now(), ...data }); // CREATE
  }
  persist();
  closeModal();
  render();
});

function deleteItem(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
if (confirm('Delete "' + item.name + '"?')) {
    items = items.filter((i) => i.id !== id); // DELETE
    persist();
    render();
  }
}

/* ===== Init: restore session after refresh ===== */
(function init() {
  const session = load(SESSION_KEY, null);
  if (session && session.email) {
    currentUser = session;
    items = load(itemsKey(session.email), []);
    showApp();
  }
})();