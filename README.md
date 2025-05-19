# Deci - Collaborative Decision Dashboard for Learning (CCDL)

## Overview

Deci is a lightweight web-based application designed to streamline organizational decision management. Built with [Next.js](https://nextjs.org/) and styled with Tailwind CSS, Deci provides a centralized platform to document, track, and analyze decisions, ensuring transparency and knowledge retention. It leverages a **Layered Architecture** to enhance maintainability, scalability, and usability.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Purpose

Deci addresses the challenges of tracking decisions in fast-paced environments, where issues like lost information, repeated discussions, and lack of transparency often arise. It achieves this by:

- Documenting decision details (context, stakeholders, impact).
- Enabling collaboration and knowledge retention.
- Providing analytics for data-driven insights.

## Features

- **Intuitive UI**: Responsive design with Tailwind CSS (e.g., `md:grid-cols-2` layouts).
- **Decision Logging**: Capture decisions with context via structured forms.
- **Analytics**: Visualize trends using Chart.js in `dashboard/page.tsx`.
- **Timelines**: Display recent decisions chronologically.
- **Dashboards**: Present metrics in a grid layout (e.g., total decisions, high-impact decisions).
- **Impact Scoring**: Highlight decisions with scores ≥ 8.
- **CRUD Operations**: Create, Read, Update, and Delete decisions via `decisionApi`.
- **Theme Toggle**: Switch between light and dark modes with optimized performance.

## Software Architecture

Deci adopts a **Layered Architecture**, dividing the system into three layers:

### Presentation Layer

- **Location**: `app/` and `components/` directories.
- **Details**: `dashboard/page.tsx` renders metrics in a responsive grid, and `app/decisions/` manages CRUD forms with Tailwind CSS for mobile responsiveness.
- **Purpose**: Ensures an accessible, user-friendly interface.

### Business Logic Layer

- **Location**: `lib/` directory.
- **Details**: `api.ts` supports `decisionApi.getAll({ limit: 1000 })` for scalable reads and CRUD operations, while `analytics.ts` handles impact scoring.
- **Purpose**: Manages decision processing and performance.

### Data Layer

- **Location**: `models/` and `routes/` directories.
- **Details**: `models/Decisions.js` defines decision structures, and `routes/decisions.js` maps API endpoints (e.g., `POST /api/decisions`).
- **Purpose**: Maintains data consistency and secure API interactions.

## Installation

### Prerequisites

Ensure the following tools are installed:

- **Node.js**: Version 14.x or later ([download](https://nodejs.org/))
- **npm** or **yarn**: Included with Node.js or install separately
- **Git**: For cloning the repository ([download](https://git-scm.com/))

### Steps

1. **Clone the Repository**

- Ensure you have Git installed on your system.
- Open a terminal and run:

  ```bash
  # Clone the repository
  git clone https://github.com/charithasekara/DECI-Collaborative-Decision-Tracking-Application.git

  ```

- Navigate into the project directory

  ```bash
   cd Deci
  ```

- Install Dependencies
  ```bash
   npm install --force
  
   yarn install --force

   ```
- Install Dependencies
    ```bash
    npm install --force
    # or
    yarn install --force
    ````

## Usage

- **Log a Decision**: Navigate to `/decisions/new`, complete the form with decision details, and submit.
- **View Decisions**: Visit `/dashboard` for an overview of metrics or `/decisions/[id]` for specific decision details.
- **Edit/Delete**: Use the edit or delete options available on individual decision pages.
- **Analytics**: Explore decision trends and patterns on the dashboard.

## Development Challenges

| **Challenge**            | **Solution**                                                       |
| ------------------------ | ------------------------------------------------------------------ |
| **Overwhelming Forms**   | Implemented stepwise forms in `app/decisions/` with Tailwind CSS.  |
| **UI Clarity**           | Enhanced responsiveness in `dashboard/page.tsx` with Tailwind CSS. |
| **Secret Leaks**         | Updated `.gitignore` and removed `.env` via `git rebase`.          |
| **CRUD Performance**     | Added pagination in `lib/api.ts` with `decisionApi.getAll()`.      |
| **Responsive Analytics** | Optimized `dashboard/page.tsx` with Tailwind CSS layouts.          |
| **TypeScript Errors**    | Simplified code and updated `tsconfig.json`.                       |
| **Form Validation**      | Added client-side validation in `app/decisions/`.                  |
| **Data Fetching**        | Improved `lib/api.ts` with error handling.                         |
| **Large Timelines**      | Used lazy loading in `dashboard/page.tsx`.                         |
| **Theme Performance**    | Cached styles in local storage for theme toggle.                   |

## Contributing

1. Fork this repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request with a clear description of your changes.

## Future Plans

- **Advanced Analytics**: Introduce predictive impact scoring.
- **User Authentication**: Implement role-based access control.
- **Real-Time Updates**: Add WebSocket or polling support.
- **Cross-Platform**: Develop a mobile application.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

- **Developers**: W.M.C.M. Weerasekara (18APC3582), W.A.S.Y. Wanniarachchi (18APC3620)
- **Email**: [charitmadhushansekara@gmail.com]

## Acknowledgments

- Gratitude to the Next.js and Tailwind CSS communities for their tools and support.
- Thanks to GitHub for security features like Push Protection.
`````
