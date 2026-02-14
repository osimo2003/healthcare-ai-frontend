AI-Powered Accessible Healthcare Assistant

Overview

This project is a full-stack AI-powered healthcare assistant designed with accessibility, safety, and transparency in mind.

It provides:

- Secure user authentication
- AI-driven NHS-based medical guidance
- Evidence-grounded responses (RAG)
- Emergency detection and warning system
- Appointment reminder system with recurring support
- Accessibility features for elderly and special needs users
- Deployed live on Render

Live Demo

Frontend:  
https://healthcare-ai-frontend-8wy7.onrender.com  

Backend API Docs:  
https://healthcare-ai-backend-re4u.onrender.com/docs  

Features

Secure Authentication
- JWT-based login
- Password hashing (bcrypt)
- Protected API routes

AI Healthcare Assistant
- Groq LLM integration
- LLM-based RAG document selection
- NHS-grounded responses
- Structured output format
- Confidence scoring
- Emergency keyword detection
- Transparent source citation

Appointment Reminder System
- Create appointments
- Recurring (none / daily / weekly)
- Popup reminder alerts
- Medical alert sound
- Anti-repeat alert logic

Accessibility Support
- Large text mode
- High contrast mode
- Quick-access healthcare buttons
- Simple structured layout

Tech Stack

Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT (python-jose)
- Passlib (bcrypt)
- Groq API
- Uvicorn

Frontend
- React
- Axios
- React Router
- Web Audio API

Deployment
- Render (Backend)
- Render Static Site (Frontend)

Architecture

Frontend (React SPA) communicates with a FastAPI backend via JWT-secured endpoints.

The backend integrates with Groq LLM and performs LLM-based Retrieval-Augmented Generation (RAG) using curated NHS documents.

Appointments are stored in SQLite and reminder logic runs client-side.

Security Considerations

- No medical diagnosis
- No prescription generation
- Educational information only
- Emergency warnings included
- API keys stored securely via environment variables

Limitations

- SQLite database (MVP only)
- Free-tier hosting (may sleep)
- Client-side reminder scheduling
- No persistent recurring auto-rescheduling yet

Future Improvements

- Cancel appointment feature
- Snooze reminder
- Professional notification modal
- Conversation memory
- Vector database RAG
- PostgreSQL production DB
- Full WCAG compliance
- Mobile-first responsive redesign

License

Educational and demonstration purposes only.
