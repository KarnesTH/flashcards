# Flashcards Backend API

A Django REST Framework backend for a flashcards application. The API enables creating and managing learning cards, decks, and learning sessions with a focus on spaced repetition learning.

## 🚀 Core Features

- **Authentication & Authorization**
  - Token-based authentication
  - Role-based access control
  - Public and private deck management

- **Learning System**
  - Spaced repetition learning sessions
  - Card review tracking
  - Difficulty rating system
  - Learning progress monitoring

- **Content Management**
  - Deck organization with tags
  - Card ordering and categorization
  - Rich text support for card content
  - Bulk operations support

- **Gamification**
  - Achievement system with badges
  - Learning streaks
  - Progress tracking
  - User statistics

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/token/` - Obtain authentication token
- `POST /api/v1/auth/token/refresh/` - Refresh authentication token

### Decks
- `GET /api/v1/decks/` - List all decks (public + owned)
- `POST /api/v1/decks/` - Create new deck
- `GET /api/v1/decks/{id}/` - Get deck details
- `PUT /api/v1/decks/{id}/` - Update deck
- `DELETE /api/v1/decks/{id}/` - Delete deck

### Cards
- `GET /api/v1/cards/` - List all cards (from owned decks)
- `POST /api/v1/cards/` - Create new card
- `GET /api/v1/cards/{id}/` - Get card details
- `PUT /api/v1/cards/{id}/` - Update card
- `DELETE /api/v1/cards/{id}/` - Delete card

### Learning Sessions
- `POST /api/v1/learning-sessions/` - Start new learning session
- `GET /api/v1/learning-sessions/` - List all learning sessions
- `POST /api/v1/learning-sessions/{id}/complete/` - Complete session
- `POST /api/v1/card-reviews/` - Create card review

### Tags & Badges
- `GET /api/v1/tags/` - List all tags
- `POST /api/v1/tags/` - Create new tag
- `GET /api/v1/badges/` - List all available badges
- `GET /api/v1/user-badges/` - List user's earned badges

## 🔍 API Features

### Filtering & Search
- **Decks**
  - Filter by public/private status
  - Filter by tags
  - Search in title and description
  - Sort by creation date, update date, title

- **Cards**
  - Filter by deck
  - Search in front and back content
  - Sort by order and creation date

- **Learning Sessions**
  - Filter by status (active/completed/abandoned)
  - Filter by deck
  - Sort by start/end date

### Data Models

#### Deck
- Title and description
- Public/private visibility
- Tag associations
- Owner reference
- Creation and update timestamps

#### Card
- Front and back content
- Order within deck
- Creation and update timestamps
- Review history

#### Learning Session
- Status tracking (active/completed/abandoned)
- Start and end timestamps
- User and deck references
- Review collection

#### Card Review
- Correct/incorrect tracking
- Difficulty rating (1-5)
- Time taken
- Session and card references

## 🔒 Security & Permissions

- Token-based authentication required for all endpoints
- Deck ownership validation
- Public deck read-only access
- Private deck owner-only access
- Session ownership validation

## 📝 API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## 🔄 CORS Configuration

API endpoints are accessible from:
- `http://localhost:3000` (React Development)
- `http://localhost:5173` (Vite Development)
- `https://flashcards.example.com` (Production)

## 🛠️ Technology Stack

- **Framework**: Django 5.1
- **API**: Django REST Framework
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Authentication**: Token-based
- **Documentation**: Swagger/OpenAPI
- **CORS**: django-cors-headers

## 📋 Voraussetzungen

- Python 3.11 oder höher
- pip (Python Package Manager)
- virtualenv (empfohlen)

## 🔧 Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd flashcards/backend
```

2. Virtuelle Umgebung erstellen und aktivieren:
```bash
python -m venv env
source env/bin/activate  # Linux/Mac
# oder
.\env\Scripts\activate  # Windows
```

3. Abhängigkeiten installieren:
```bash
pip install -r requirements.txt
```

4. Datenbank migrieren:
```bash
python manage.py migrate
```

5. Entwicklungsserver starten:
```bash
python manage.py runserver
```

## 🧪 Tests

Tests ausführen:
```bash
python manage.py test cards
```

## 📈 Nächste Schritte

- [ ] Bulk-Operationen für Karten
- [ ] Erweiterte Statistiken
- [ ] Export/Import-Funktionalität
- [ ] Rate Limiting
- [ ] Caching-Strategie
- [ ] Performance-Optimierungen

## 🤝 Beitragen

1. Fork erstellen
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen 