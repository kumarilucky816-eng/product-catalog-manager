\# Product Catalog Manager



A responsive web app to manage a product catalog, built with HTML, CSS and vanilla JavaScript. This is my Production Capstone Project for the Full Stack Web Development course at RABTECH Academy.



Live Demo: ADD-YOUR-LIVE-URL-HERE

GitHub Repository: ADD-YOUR-GITHUB-URL-HERE



\## Features



\- Authentication simulation: Signup, Login and Logout with validation

\- Session stays active after page refresh

\- Separate catalog for every user account

\- Interactive catalog: live search, category filter and sorting

\- Dynamic CRUD: add, edit and delete items using a form

\- Persistent state: all data is saved in localStorage

\- Dashboard stats: total items, total inventory value, low-stock count

\- Responsive design for mobile and desktop



\## Architecture



&#x20;   User

&#x20;    |

&#x20;    v

&#x20;   index.html + style.css (UI)

&#x20;    |

&#x20;    v

&#x20;   app.js

&#x20;    |-- Auth (Signup / Login / Logout)

&#x20;    |      |-- localStorage: pc\_users

&#x20;    |      |-- localStorage: pc\_session

&#x20;    |

&#x20;    |-- Catalog (Search / Filter / Sort)

&#x20;    |

&#x20;    |-- CRUD (Add / Edit / Delete)

&#x20;           |-- localStorage: pc\_items\_<email>



\## Project Structure



\- index.html : page structure (login form, catalog, add/edit form)

\- style.css  : styling and responsive layout

\- app.js     : authentication, CRUD, search/filter/sort, saving data

\- README.md  : project documentation



\## Setup Instructions



1\. Download or clone this repository.

2\. Open index.html in any modern browser.

3\. Click Signup, create an account and start adding items.



No installation or build step is required.



\## Deployment



The project is deployed as a static site on Vercel / Netlify / Cloudflare Pages by connecting the GitHub repository.



\## Note



The authentication is only a simulation for learning. Passwords are stored in the browser localStorage. A real application must hash passwords and verify users on a secure server.



\## Tech Stack



HTML5, CSS3, JavaScript (ES6), localStorage, Git and GitHub



\## Author



Lucky Kumari - RABTECH Academy

