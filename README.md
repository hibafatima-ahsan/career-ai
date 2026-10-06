# CareerAI — Smart Internship & Career Assistant

![Project Status](https://img.shields.io/badge/Status-MVP%20Completed-success)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Flask-black)
![Database](https://img.shields.io/badge/Database-Supabase-green)
![AI](https://img.shields.io/badge/AI-Ollama%20%7C%20Qwen-purple)
![Testing](https://img.shields.io/badge/Testing-Pytest-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

# 📌 Project Overview

**CareerAI** is a full-stack AI-powered internship and career assistance platform designed to help students discover internship opportunities, analyze their skills, and receive personalized career guidance.

The system provides a centralized platform where:

- Students can register, login, browse internships, interact with an AI career assistant, and receive career recommendations.
- Companies can register, login, create internship opportunities, view their postings, and delete internships.
- Administrators can monitor users, internships, and overall platform statistics.

CareerAI combines a modern **React frontend**, **Flask REST API backend**, **Supabase PostgreSQL database**, and **local AI models through Ollama**.

The AI workflow is implemented using **LangChain and LangGraph**, allowing the system to process user questions, analyze mentioned skills, and generate career recommendations.

---

# 🎯 Problem Statement

Students often face difficulty identifying suitable internship opportunities based on their technical skills, education, and career interests.

At the same time, companies need a simple platform through which they can publish internship opportunities.

CareerAI addresses these problems by providing:

- Centralized internship discovery
- AI-powered career assistance
- Skill-based recommendations
- Company internship management
- Role-based access
- Administrative monitoring
- Centralized database management

---

# 🎯 Project Objectives

The main objectives of CareerAI are:

1. Build a centralized internship platform for students and companies.
2. Provide AI-powered career guidance.
3. Analyze technical skills mentioned by students.
4. Generate personalized career recommendations.
5. Allow companies to publish internship opportunities.
6. Provide administrators with system monitoring capabilities.
7. Implement secure authentication and authorization.
8. Use REST APIs for frontend-backend communication.
9. Integrate a PostgreSQL database through Supabase.
10. Use local AI models to reduce dependency on paid AI APIs.
11. Implement automated backend testing.
12. Maintain the project using Git and GitHub.

---

# 🚀 Main Features

## 👨‍🎓 Student Features

- Student registration
- Student login
- Secure authentication
- View available internships
- AI career assistant
- Skill analysis
- Career recommendations
- Personalized career guidance
- Internship discovery

---

## 🏢 Company Features

- Company registration
- Company login
- Add internship opportunities
- View internship postings
- Delete internship postings
- Manage company-created internships

---

## 👨‍💼 Admin Features

- Admin login
- View registered users
- View all internships
- View platform statistics
- Monitor students
- Monitor companies
- Monitor administrator accounts

Admin accounts are managed separately and are not available through normal public registration.

---

# 🤖 AI Features

CareerAI includes an AI-powered career assistance system.

The current local AI setup uses:

- Ollama
- Qwen 2.5
- LangChain
- LangGraph

The AI system can:

- Understand career-related questions
- Identify technical skills from user input
- Analyze mentioned technologies
- Generate career recommendations
- Suggest internship directions
- Provide practical career guidance

---

# 🔄 Complete System Workflow

```text
                         USER
                           │
                           ▼
                  React Frontend
                           │
                           │ HTTP REST API
                           ▼
                   Flask Backend
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
   Authentication    Internship System    AI System
          │                │                 │
          │                │                 ▼
          │                │             LangGraph
          │                │                 │
          │                │        ┌────────┴────────┐
          │                │        ▼                 ▼
          │                │   Skill Analysis    Recommendation
          │                │        │                 │
          │                │        └────────┬────────┘
          │                │                 │
          └────────────────┼─────────────────┘
                           │
                           ▼
                    Supabase PostgreSQL
🏗️ System Architecture

CareerAI follows a layered full-stack architecture.

┌───────────────────────────────────────────┐
│              React Frontend               │
│          Vite + JavaScript + CSS          │
└──────────────────────┬────────────────────┘
                       │
                       │ REST API
                       ▼
┌───────────────────────────────────────────┐
│              Flask Backend                │
│       Python + Flask + JWT + RBAC         │
└───────────────┬───────────────┬───────────┘
                │               │
                │               ▼
                │        ┌───────────────┐
                │        │   AI System   │
                │        │    Ollama     │
                │        │    Qwen 2.5   │
                │        │   LangChain   │
                │        │   LangGraph   │
                │        └───────────────┘
                │
                ▼
┌───────────────────────────────────────────┐
│           Supabase PostgreSQL             │
│                                           │
│ Users │ Profiles │ Internships            │
└───────────────────────────────────────────┘
 # 🛠️ Technology Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, Flask
- **Database:** Supabase PostgreSQL
- **Authentication:** JWT
- **Password Security:** bcrypt
- **Authorization:** Role-Based Access Control (RBAC)
- **AI Runtime:** Ollama
- **AI Model:** Qwen 2.5
- **AI Framework:** LangChain
- **Agent Workflow:** LangGraph
- **API Communication:** REST API
- **Testing:** Pytest
- **Version Control:** Git
- **Code Hosting:** GitHub
- **CI/CD:** GitHub Actions
- **Backend Deployment:** PythonAnywhere
- **Frontend Deployment:** Vercel
👥 User Roles

CareerAI supports three major user roles.

Student

Students can:

Register
Login
Browse internships
Ask AI career questions
Get skill analysis
Generate career recommendations
Company

Companies can:

Register
Login
Create internships
View internships
Delete internships
Admin

Administrators can:

Login
View users
View internships
View platform statistics
Monitor the system
🔐 Authentication & Authorization

CareerAI uses JWT-based authentication.

The authentication workflow is:

User Login
     │
     ▼
Flask API
     │
     ▼
Find User by Email
     │
     ▼
Verify bcrypt Password
     │
     ▼
Generate JWT Token
     │
     ▼
Frontend Receives Token
     │
     ▼
Protected API Requests
     │
     ▼
JWT Verification
     │
     ▼
Role-Based Access
🔒 Role-Based Access Control

Role-Based Access Control ensures that users can only access functionality allowed for their role.

Student
   │
   └── Student Features

Company
   │
   └── Internship Management

Admin
   │
   └── System Management

Examples:

Student → Cannot create internships

Company → Can create/delete internships

Admin → Can view users, internships and statistics
🗄️ Database Design

CareerAI uses Supabase PostgreSQL as its database.

The main database tables are:

users
profiles
internships
Users Table

Stores user authentication and role information.

users
├── id
├── name
├── email
├── password
├── role
└── created_at
Profiles Table

Stores additional profile information.

profiles
├── id
├── user_id
├── education
├── skills
├── bio
├── experience
└── created_at
Internships Table

Stores internship opportunities.

internships
├── id
├── company_id
├── title
├── description
├── skills
├── location
├── stipend
├── duration
└── created_at
🤖 AI Architecture

CareerAI uses a local AI model through Ollama.

Current model:

Qwen 2.5 — 0.5B

The AI service uses LangChain to communicate with the local model.

LangGraph is used to create a structured career recommendation workflow.

🧠 AI Career Recommendation Workflow
User Question
      │
      ▼
LangGraph State
      │
      ▼
Analyze User Input
      │
      ▼
Identify Skills
      │
      ▼
Generate Recommendation
      │
      ▼
Return Career Guidance

For example:

User Input:

"I know Python, Flask and SQL."

          ↓

Skill Analysis:

Python
Flask
SQL

          ↓

Career Recommendation:

Explore Python/Flask backend internships,
build practical projects and improve your
GitHub portfolio.
🔗 LangGraph Workflow

The recommendation system contains two main processing nodes.

                  ┌──────────────────┐
                  │   User Question  │
                  └────────┬─────────┘
                           │
                           ▼
                ┌────────────────────┐
                │  Analyze Skills    │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ Generate Career    │
                │ Recommendation     │
                └─────────┬──────────┘
                          │
                          ▼
                     Final Result

The skill analysis identifies technologies mentioned in the user's question.

The recommendation stage generates practical career guidance based on the identified skills.

🌐 API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
Internships
GET    /api/internships/
POST   /api/internships/
DELETE /api/internships/<id>
AI
POST /api/ai/career-recommendation
Admin
GET /api/admin/users
GET /api/admin/internships
GET /api/admin/stats
System
GET /api/health
GET /api/test-db
📂 Project Structure
career-ai/
│
├── backend/
│   │
│   ├── app.py
│   ├── config.py
│   │
│   ├── middleware/
│   │   └── auth.py
│   │
│   ├── database/
│   │   └── supabase_client.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── internships.py
│   │   ├── ai.py
│   │   └── admin.py
│   │
│   ├── services/
│   │   └── ai_service.py
│   │
│   └── tests/
│       └── test_api.py
│
├── frontend/
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── career-ai-1.png
│   └── career-ai-2.png
│
├── .gitignore
├── README.md
└── requirements.txt
⚙️ Installation
1. Clone the Repository
git clone https://github.com/hibafatima-ahsan/career-ai.git
cd career-ai
2. Create Python Environment

Using Conda:

conda create -n career-ai python=3.12

Activate the environment:

conda activate career-ai
3. Install Backend Dependencies
cd backend
pip install -r requirements.txt
4. Install Frontend Dependencies

Open another terminal:

cd frontend
npm install
🔑 Environment Variables

Create a .env file inside the backend directory.

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_secret_key

For local AI, Ollama should also be installed and running.

Important: Never commit .env files, Supabase keys, JWT secrets, or other credentials to GitHub.

🤖 Ollama Setup

CareerAI uses Ollama for local AI inference.

Install Ollama and download the required model:

ollama pull qwen2.5:0.5b

Verify the installed models:

ollama list

Make sure Ollama is running before using the AI features.

▶️ Running the Backend

Open a terminal:

cd backend
conda activate career-ai
python app.py

The Flask backend normally runs at:

http://127.0.0.1:5000

Test the API:

http://127.0.0.1:5000/

Health check:

http://127.0.0.1:5000/api/health
▶️ Running the Frontend

Open another terminal:

cd frontend
npm run dev

Vite will provide a local URL, normally:

http://localhost:5173

Open that URL in your browser.

🧑‍💻 How to Use CareerAI
Student Workflow
1. Open CareerAI
        ↓
2. Register as Student
        ↓
3. Login
        ↓
4. Open Dashboard
        ↓
5. Browse Internships
        ↓
6. Ask AI Career Questions
        ↓
7. Generate Career Recommendation
Example AI Question
I know Python, Flask, SQL and basic machine learning.
What type of internship should I apply for?
Company Workflow
1. Open CareerAI
        ↓
2. Register as Company
        ↓
3. Login
        ↓
4. Open Dashboard
        ↓
5. Add Internship
        ↓
6. Enter Internship Details
        ↓
7. Publish Internship
        ↓
8. Manage Internship
Admin Workflow
1. Login with Admin Account
        ↓
2. Open Admin Dashboard
        ↓
3. View Statistics
        ↓
4. View Users
        ↓
5. View Internships
📸 Screenshots

The following screenshots demonstrate the CareerAI application interface.

CareerAI Interface — Screenshot 1

CareerAI Interface — Screenshot 2

🧪 Testing

Backend API tests are implemented using Pytest.

Run the tests:

cd backend
pytest

The test suite covers important backend functionality including:

Home endpoint
Health endpoint
Internship endpoint
Authentication protection
Protected AI endpoint

Example result:

4 passed
🔄 GitHub Actions CI

GitHub Actions is used to automatically test the backend whenever changes are pushed to GitHub.

The CI workflow follows:

Developer Push
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ▼
Install Python Dependencies
      │
      ▼
Run Pytest
      │
      ▼
Tests Pass / Fail

This helps ensure that new changes do not break existing backend functionality.

🌳 Git Workflow

The project uses Git and GitHub for version control.

Typical workflow:

git status
git add .
git commit -m "Update CareerAI features"
git push origin main

The project repository is hosted on GitHub.

🚀 Deployment Architecture

The planned production architecture is:

                    Users
                      │
                      ▼
              React Frontend
                      │
                      ▼
                   Vercel
                      │
                  REST API
                      │
                      ▼
              Flask Backend
                      │
                      ▼
               PythonAnywhere
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
       Supabase DB         AI Service
       PostgreSQL          Ollama/API

The frontend is planned for deployment on Vercel and the Flask backend on PythonAnywhere.

The database is hosted through Supabase.

🔐 Security Considerations

CareerAI includes several security practices:

Password hashing with bcrypt
JWT-based authentication
Token validation
Role-based authorization
Environment variables for secrets
Protected API routes
Admin-only endpoints
.env excluded from version control

Sensitive credentials should never be stored directly in source code.

📊 Current Project Status
Completed
 React frontend
 Flask backend
 Supabase PostgreSQL integration
 Student registration
 Company registration
 Login system
 JWT authentication
 Password hashing
 Role-based access control
 Internship creation
 Internship listing
 Internship deletion
 AI assistant
 Ollama integration
 Qwen 2.5 integration
 LangChain integration
 LangGraph workflow
 Career recommendation
 Admin statistics
 Backend API testing
 GitHub repository
 GitHub Actions CI
 Responsive dashboard UI
 Project screenshots
In Progress / Planned
 Student profile management
 Advanced internship filtering
 Resume analysis
 Resume-to-internship matching
 RAG-based career knowledge system
 Advanced AI agents
 Internship application tracking
 Email notifications
 Production deployment
 Cloud AI integration if required
🔮 Future Improvements

Future versions of CareerAI can include:

1. Resume Analysis

Students could upload their resumes and receive:

Skill extraction
Resume feedback
Missing skill identification
Internship matching
2. Intelligent Internship Matching

The system could compare:

Student Skills
      +
Education
      +
Experience
      +
Internship Requirements
      ↓
Match Score
3. RAG Career Knowledge System

A retrieval-augmented generation system could use career and green-job datasets to provide more domain-specific recommendations.

4. Application Tracking

Students could track:

Saved
  ↓
Applied
  ↓
Interview
  ↓
Selected / Rejected
5. Advanced AI Agents

The system can be expanded into multiple specialized agents:

Profile Agent
      │
      ▼
Knowledge Agent
      │
      ▼
Recommendation Agent
      │
      ▼
Career Planning Agent
📚 Learning Outcomes

This project provides practical experience in:

Full-stack web development
React development
Vite
JavaScript
Responsive UI development
Python programming
Flask REST API development
REST architecture
PostgreSQL
Supabase
JWT authentication
bcrypt password security
Role-Based Access Control
AI integration
Ollama
Qwen
LangChain
LangGraph
Automated testing
Pytest
Git
GitHub
GitHub Actions
CI/CD concepts
Cloud deployment
🧩 Key Technical Concepts Demonstrated

The project demonstrates practical implementation of:

Frontend
   │
   ├── React
   ├── Components
   ├── State Management
   ├── API Requests
   └── Responsive UI

Backend
   │
   ├── Flask
   ├── REST APIs
   ├── Routes
   ├── Middleware
   └── Authentication

Database
   │
   ├── PostgreSQL
   ├── Supabase
   ├── Relationships
   └── CRUD Operations

AI
   │
   ├── Ollama
   ├── Qwen
   ├── LangChain
   └── LangGraph

DevOps
   │
   ├── Git
   ├── GitHub
   ├── GitHub Actions
   └── Deployment
📁 Repository

GitHub Repository:

https://github.com/hibafatima-ahsan/career-ai

👩‍💻 Author

Hiba Fatima Ahsan

BS Computer Science

GitHub:

https://github.com/hibafatima-ahsan

📄 Project Summary

CareerAI — Smart Internship & Career Assistant is a full-stack AI-powered career platform that combines web development, database management, authentication, REST APIs, and artificial intelligence.

The project provides separate workflows for students, companies, and administrators while using local AI capabilities to provide career assistance and recommendations.

The architecture is designed to be extendable so that additional AI agents, RAG capabilities, resume analysis, internship matching, and application tracking can be added in future versions.

⭐ Final Project Workflow
                    CAREERAI
                       │
                       ▼
              ┌─────────────────┐
              │  React Frontend │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Flask REST API │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Authentication   Internships      AI
        │              │              │
        │              │       ┌──────┴──────┐
        │              │       ▼             ▼
        │              │  LangChain      LangGraph
        │              │       │             │
        │              │       └──────┬──────┘
        │              │              ▼
        │              │        Qwen 2.5
        │              │        via Ollama
        │              │
        └──────────────┼──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    Supabase     │
              │   PostgreSQL    │
              └─────────────────┘
                       │
                       ▼
             CareerAI Platform
✅ CareerAI

Smart Internship & Career Assistant

Built with:

React + Flask + Supabase + Ollama + Qwen + LangChain + LangGraph + GitHub Actions
