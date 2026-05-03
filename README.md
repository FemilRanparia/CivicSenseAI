# CivicSense AI - Empowering Voters Through AI

CivicSense AI is a full-stack, AI-powered election simulation and guidance platform designed to demystify the Indian voting process for first-time and experienced voters alike.

## 1. Chosen Vertical: Civic Tech & EdTech
This project sits at the intersection of **Civic Technology** (building digital infrastructure to enhance citizen engagement with government processes) and **Educational Technology** (teaching complex, bureaucratic systems in an accessible, gamified way). 

In India, millions of first-time voters become eligible every year, yet the sheer complexity of registration, EVM operation, and booth protocols leads to voter apathy or confusion. CivicSense AI solves this by transforming static government guidelines into a highly personalized, interactive, and simulated educational journey.

## 2. Approach and Logic
Instead of building a generic "chat wrapper" over an AI model, the approach focused on creating a **context-aware application state**:
* **Zero-Friction Context:** We eliminate the need for complex prompting. Upon signup, the system captures demographic data (Age, State, First-Time Voter status, Language preference). 
* **Stateful Syncing:** This demographic data is permanently synced to the MongoDB backend.
* **Prompt Injection (Backend):** When a user asks a question, the backend automatically injects their demographic profile into a heavily engineered system prompt before sending it to the Gemini API. 
* **Gamification:** Complex bureaucratic steps are broken down into a "Journey Timeline"—a visual, interactive checklist where users can track their real-world progress.

## 3. How the Solution Works
1. **Authentication:** Users sign up with their demographics. Passwords are cryptographically hashed via `bcryptjs`.
2. **Dashboard Generation:** Upon login, the React frontend requests a customized timeline from the Node.js/Express backend. 
3. **AI Generation:** The backend uses the Gemini API to generate a JSON-structured roadmap tailored exactly to the user's age and state (e.g., instructing an 18-year-old on Form 6 registration vs. a 30-year-old on roll verification).
4. **Interactive Chat:** The user can interact with the AI Guide. The UI features a glassmorphism design, smart scroll detection, and auto-generated follow-up suggestions to drive engagement.
5. **Security:** The backend is hardened with `helmet` (HTTP header security), `express-rate-limit` (protecting the Gemini API from abuse), and DOM sanitization on the frontend to prevent XSS attacks from AI-generated markdown.

## 4. Assumptions Made
* **API Availability:** The system assumes the Google Gemini API (`generativelanguage.googleapis.com`) is reachable. A robust try/catch fallback loop iterates through 6 different Gemini models to guarantee a response even if one model is overloaded.
* **Internet Connectivity:** The application requires an active internet connection to communicate between the Netlify frontend, Render backend, and MongoDB database.
* **Target Audience:** The system is optimized assuming the primary users are digital-native youth (18-25). Hence, the inclusion of "Hinglish" language support, dark mode aesthetics, and micro-animations to maximize engagement with younger demographics.

---

## Project Structure
```text
CivicSense AI/
├── backend/                  # Node.js + Express + Gemini API
│   ├── controllers/
│   │   ├── chatController.js     # Handles AI chat interactions
│   │   └── journeyController.js  # Generates the personalized timeline
│   ├── .env                  # Environment variables
│   ├── package.json          
│   └── server.js             # Express app entry point
│
└── frontend/                 # React + Vite
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx           # Main routing & layout
        ├── index.css         # UI Design System (Vanilla CSS, Glassmorphism)
        ├── main.jsx          # React entry point
        └── components/
            ├── ChatAssistant.jsx   # AI Chatbot interface
            ├── Dashboard.jsx       # Main layout holding timeline and chat
            ├── JourneyTimeline.jsx # Visual timeline tracking
            └── ProfileForm.jsx     # Onboarding form for user details
```

## Prompt Engineering for AI Responses

The Gemini API is integrated using targeted prompt engineering to ensure accurate, empathetic, and domain-specific responses.

### 1. Chat Assistant Prompt
**Goal:** Provide friendly, conversational assistance while avoiding complex jargon.
```javascript
`
You are an expert, friendly Election Guide Assistant named CivicSense AI.
User Profile: 
- Age: ${age}
- State: ${state}
- First-time voter: ${firstTimeVoter}
- Preferred Language: ${language}

User Message: "${message}"

Instructions:
1. Provide a helpful, concise response avoiding complex legal jargon.
2. Use analogies and simple terms if explaining rules.
3. Maintain a conversational, empathetic tone.
4. Provide actionable guidance (step-by-step).
5. Respond in the user's preferred language. If Hinglish, mix Hindi written in English script naturally.
6. Return a JSON object with two fields: 'response' (the text reply) and 'suggestions' (array of 2-3 short follow-up questions).
`
```

### 2. Journey Generator Prompt
**Goal:** Generate structured, actionable timelines based on user context.
```javascript
`
Create a personalized election journey timeline for a user in India.
User Profile: Age ${age}, State ${state}, First-time voter: ${firstTimeVoter}, Language: ${language}.

Generate a step-by-step timeline of election-related events from registration to voting day. 
Keep explanations simple, avoiding legal jargon.

Return ONLY a JSON object in this format:
{
  "timeline": [
    {
      "title": "Step Title",
      "description": "Simple description of what to do",
      "status": "pending",
      "date": "When this should happen (e.g. ASAP, Election Day)"
    }
  ]
}
`
```

## Sample Mock Data / Fallback Dataset
If the API key is missing or rate-limited, the application gracefully degrades to using mock data:

**Mock Journey Data:**
```json
{
  "timeline": [
    {
      "title": "Check Voter Registration",
      "description": "Start by verifying if your name is on the electoral roll.",
      "status": "pending",
      "date": "Anytime before election notification"
    },
    {
      "title": "Apply for Voter ID",
      "description": "Ensure your details on the voter ID are up to date.",
      "status": "pending",
      "date": "ASAP"
    },
    {
      "title": "Verify Polling Booth",
      "description": "Locate your assigned polling booth online before the voting day.",
      "status": "pending",
      "date": "1-2 weeks before election"
    },
    {
      "title": "Voting Day Process",
      "description": "Go to the booth, show your ID, get inked, and press the button on the EVM.",
      "status": "pending",
      "date": "Election Day"
    }
  ]
}
```

## Deployment Steps

To deploy this full-stack application to a production environment (e.g., Render, Vercel + Railway):

### 1. Database (MongoDB)
* Set up a free MongoDB Atlas cluster.
* Get the connection string and add it to your production backend environment variables.

### 2. Backend Deployment (e.g., Render / Railway)
1. Push your code to a GitHub repository.
2. Create a new Web Service on Render/Railway.
3. Connect your repository and set the root directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   * `PORT`: `5000`
   * `GEMINI_API_KEY`: Your Google Gemini API Key
   * `MONGODB_URI`: Your MongoDB connection string

### 3. Frontend Deployment (e.g., Vercel / Netlify)
1. In Vercel, create a new project from your GitHub repository.
2. Set the Root Directory to `frontend`.
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   * `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com/api`)

### 4. Testing
The backend features an automated test suite using `jest` and `supertest`.
To run tests locally:
```bash
cd backend
npm run test
```
All API routes, including authentication and health checks, are covered.

### 5. Continuous Integration
* Set up CI/CD so any pushes to the `main` branch automatically rebuild and deploy both frontend and backend.
