# SpaceX-Mission-Explorer
This is a web application built using Vite, TypeScript, React, shadcn-ui and Tailwind CSS. It allows users to browse, search, filter, and favorite SpaceX missions by consuming the **public SpaceX v4 API**. The application is designed to be clean, responsive, and user-friendly.

## Features

- A list of all SpaceX launches with key details like mission name, date, and rocket.
  
  <img width="1917" height="905" alt="Screenshot 2025-09-29 115217" src="https://github.com/user-attachments/assets/a965c997-0a86-4c54-8ad8-28b5f275b6f2" />

- Search for missions by name with a debounced input for better performance. 

  <img width="1919" height="902" alt="Screenshot 2025-09-29 115940" src="https://github.com/user-attachments/assets/969970d8-9ca3-46af-908a-f414dc70f004" />

- Filter launches by year and by success status.

  <img width="1919" height="904" alt="Screenshot 2025-09-29 115230" src="https://github.com/user-attachments/assets/5029ed11-fd31-4750-bcd9-bab62b8cb587" />

- Mark or unmark missions as favorites, with the selection saved to localStorage. A toggle is available to view only favorite missions.

  <img width="1919" height="915" alt="Screenshot 2025-09-29 115255" src="https://github.com/user-attachments/assets/cdd18094-5abe-4f7b-b8d0-76e0911ea545" />

- Click on any mission to see a detailed view in a modal or on a separate page, including the mission patch, a full description, and links to the webcast. 

- The UI is fully responsive for both mobile and desktop screens and supports keyboard navigation. 

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL:
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory:
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies:
npm i

# Step 4: Start the development server with auto-reloading and an instant preview:
npm run dev

# Step 5: To run tests:
npm run test
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# Feel free to fork and contribute !!
