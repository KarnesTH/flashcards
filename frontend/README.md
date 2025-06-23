# Flashcards Frontend

A modern and responsive frontend for the Flashcards application, built with Astro, React, and Tailwind CSS. It provides a rich user interface for managing decks, learning cards, and tracking progress.

## 🚀 Core Features

- **Interactive Dashboard**
  - At-a-glance user statistics (accuracy, cards reviewed, etc.).
  - Quick access to recent and popular decks.
  - Visualization of learning progress.

- **Intelligent Learning Sessions**
  - Interactive card-flipping interface powered by the backend's Spaced Repetition System (SRS).
  - Real-time feedback on answers.
  - Time tracking per card to influence the SRS algorithm.

- **Full Deck & Card Management**
  - Create, read, update, and delete decks and cards.
  - Browse public decks from other users.
  - Seamlessly add new cards to any owned deck.

- **Markdown & Code Support**
  - Renders card fronts and backs using Markdown.
  - Supports syntax highlighting for code blocks in various languages.

- **User Profile Management**
  - Edit user information (bio, name, etc.).
  - Upload and manage a custom user avatar.

## 🏗️ Project Structure

The project uses a standard Astro project structure, separating pages, layouts, and components for a clean architecture.

```text
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components (.tsx)
│   ├── layouts/         # Astro layouts for page structure
│   ├── lib/             # Core logic (e.g., api.ts)
│   ├── pages/           # Site pages and API endpoints (.astro)
│   └── types/           # TypeScript definitions
└── package.json
```

## 🧞 Commands

All commands are run from the root of the `/frontend` directory from a terminal:

| Command          | Action                                           |
| :--------------- | :----------------------------------------------- |
| `yarn install`   | Installs dependencies                            |
| `yarn dev`       | Starts the local dev server at `localhost:4321`  |
| `yarn build`     | Builds the production site to `./dist/`          |
| `yarn preview`   | Previews the production build locally            |

## 🛠️ Technology Stack

- **Framework**: Astro
- **UI Library**: React
- **Styling**: Tailwind CSS
- **API Communication**: Fetch API via a typed API client
- **Typing**: TypeScript
