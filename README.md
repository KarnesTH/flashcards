# Flashcards – Intelligent Learning App

## 📚 Project Overview

Flashcards is a modular, AI-enhanced learning application designed to make studying more effective, engaging, and developer-friendly. The project consists of three main components:

- **Backend (Django, Python)**  
  Provides the core API, user management, spaced repetition logic, gamification systems, and handles communication with the AI module.

- **Frontend (Astro + React)**  
  A fast, modern UI that renders Markdown-based flashcards with syntax highlighting, interactive components, and gamified progress tracking.

- **AI Module (Rust)**  
  Responsible for generating flashcard content automatically using AI models based on user-provided topics. The AI logic runs in a standalone Rust service, allowing for efficient, isolated processing.

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend
        UI[fa:fa-desktop Astro + React UI]
        MD[Markdown Rendering]
        SRS[Spaced Repetition UI]
        GAME[Gamification UI]
    end

    subgraph Backend
        RESTfull[fa:fa-server Django REST API]
        AUTH[Token Auth]
        GAME_LOGIC[Gamification System]
        SRS_LOGIC[Spaced Repetition Logic]
    end

    subgraph Endpoints
        DECKS[Decks API]
        CARDS[Cards API]
        SESSIONS[Learning Sessions]
        BADGES[Badges & Achievements]
    end

    subgraph LLM
        AI[fa:fa-robot Rust Ollama Service]
        GEN[Card Generation]
    end

    subgraph DB
        SQL[fa:fa-database SQLite3/PostgreSQL]
        MODELS[(Data Models)]
    end

    Frontend <--> Backend
    Backend --> LLM
    Backend <--> DB
    Backend <--> Endpoints
    
    UI --> MD
    UI --> SRS
    UI --> GAME
    
    RESTfull --> AUTH
    RESTfull --> GAME_LOGIC
    RESTfull --> SRS_LOGIC
    
    DB --> MODELS
```

---

### 🔍 Key Features

- AI-powered flashcard generation
- Markdown support with code syntax highlighting
- Spaced repetition system (SRS)
- Gamification with badges and XP
- Clean separation of concerns via Dockerized architecture

---

> This project is structured for future extensibility, allowing each component to evolve independently. The backend and AI service run in isolated containers, while the frontend can be deployed separately via NGINX or any static host.