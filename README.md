Deci - Collaborative Decision Dashboard for Learning (CCDL)
Overview
Welcome to Deci, a lightweight web-based application designed to track and manage organizational decisions effectively. Built with Next.js, Deci addresses the challenge of undocumented decisions by providing a centralized, searchable history of decisions, including their context, stakeholders, and impact. As of 12:28 PM +0530 on Monday, May 19, 2025, Deci leverages a Layered Architecture (Presentation, Business Logic, and Data layers) to ensure maintainability, scalability, and usability.
Purpose
In today’s fast-paced industrial environment, decisions—ranging from strategic moves to operational choices—drive progress. However, tracking these decisions often leads to issues like lost information, repeated discussions, and reduced transparency. Deci solves these problems by:

Documenting the "why," "what," "who," and "how" of decisions.
Enhancing collaboration and knowledge retention.
Supporting data-driven insights with analytics.

Features

Simplified UI: An intuitive interface using Tailwind CSS for responsive design (e.g., md:grid-cols-2 layouts, max-h-[280px] charts).
Dedicated Decision Logging: Capture decisions with context, reasoning, and stakeholders via structured forms.
Decision Analytics: Display trends with a Chart.js line chart in dashboard/page.tsx over 6 or 12 months.
Decision Timelines: View recent decisions (e.g., last five) in a chronological list.
Decision Dashboards: Show metrics (total decisions, high-impact decisions) in a grid layout with links to details.
Scoring Decision Impact Levels: Highlight decisions with impact scores ≥ 8.
CRUD Operations: Create, Read, Update, and Delete decisions with decisionApi functions.
Theme Selection (Light/Dark): Toggle between themes with performance-optimized local storage caching.

Software Architecture
Deci is built using a Layered Architecture, which organizes the system into three layers:
Presentation Layer

Location: app/ and components/ directories.
Implementation: dashboard/page.tsx displays metrics in a responsive grid, while app/decisions/ handles CRUD forms with Tailwind CSS (e.g., flex flex-col sm:flex-row). The light/dark theme toggle enhances user experience.
Purpose: Ensures a clear, accessible UI across devices.

Business Logic Layer

Location: lib/ directory.
Implementation: api.ts includes decisionApi.getAll({ limit: 1000 }) for scalable reads, decisionApi.create(), update(), and delete() for CRUD, with error handling and pagination. analytics.ts processes impact scores.
Purpose: Manages decision processing and optimizes performance.

Data Layer

Location: models/ and routes/ directories.
Implementation: models/Decisions.js defines the Decision structure (e.g., id, title, impactScore), while routes/decisions.js maps endpoints like POST /api/decisions and DELETE /api/decisions/:id.
Purpose: Ensures data consistency and secure API handling.

This architecture guided development, addressing challenges like secret leaks and CRUD scalability.
Installation and Setup
Prerequisites

Node.js (v14.x or later)
npm or yarn
Git

Steps

Clone the Repository:git clone https://github.com/charithasekara/Deci.git
cd Deci


Install Dependencies:npm install
# or
yarn install


Set Up Environment Variables:
Create a .env file in the root directory (ensure it’s in .gitignore to avoid commits).
Add required variables (e.g., API keys if integrated):NEXT_PUBLIC_API_URL=http://localhost:3000/api


Note: Avoid committing sensitive data; use a .env.example for reference.


Run the Development Server:npm run dev
# or
yarn dev


Open http://localhost:3000 in your browser.



Troubleshooting

If the .env file causes a GitHub Push Protection error, update .gitignore to include /env and remove it from history with:git rm --cached .env
git rebase -i <commit-hash>~1
git push --force



Usage

Logging a Decision: Navigate to /decisions/new, fill out the form (title, impact score, etc.), and submit.
Viewing Decisions: Check the dashboard at /dashboard for metrics or /decisions/[id] for details.
Editing/Deleting: Use the respective options on decision detail pages.
Analytics: Explore trends on the dashboard with the selectable time range.

Development Challenges and Solutions



Challenge
Implemented Solution



Overwhelming Decision Input Forms
Used a stepwise approach in app/decisions/ with Tailwind CSS (flex flex-col sm:flex-row).


Ensuring UI Clarity
Enhanced dashboard/page.tsx with Tailwind CSS (md:grid-cols-2, max-h-[280px]).


Handling Secret Leaks in Repository
Updated .gitignore, removed .env via git rebase, and force-pushed.


Optimizing CRUD Performance
Added pagination in lib/api.ts with decisionApi.getAll({ limit: 1000 }).


Integrating Responsive Analytics
Refined dashboard/page.tsx with Tailwind CSS (aspect-[4/3], max-h-[280px]).


Managing TypeScript Errors
Simplified code and adjusted tsconfig.json for type safety.


Improving Form Validation
Added client-side checks in app/decisions/ with business logic rules.


Ensuring Consistent Data Fetching
Optimized lib/api.ts with error handling and retry logic.


Handling Large Decision Timelines
Implemented lazy loading in dashboard/page.tsx with Decisions.js support.


Enhancing Theme Switch Performance
Cached styles in local storage for the presentation layer’s theme toggle.


Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/new-feature).
Commit changes (git commit -m "Add new feature").
Push to the branch (git push origin feature/new-feature).
Open a pull request.

Future Plans

Advanced Analytics: Add predictive impact scores.
User Authentication: Implement role-based access (e.g., admin, viewer).
Real-Time Updates: Introduce WebSocket or polling for live data.
Cross-Platform Support: Develop a mobile app with React Native.

License
This project is licensed under the MIT License - see the LICENSE.md file for details.
Contact

Developers: W.M.C.M. Weerasekara (18APC3582), W.A.S.Y. Wanniarachchi (18APC3620)
Email: [your-email@example.com]
GitHub: https://github.com/charithasekara/Deci

Acknowledgments

Thanks to the Next.js and Tailwind CSS communities for robust tools.
Appreciation to GitHub for Push Protection, which improved our security practices.

