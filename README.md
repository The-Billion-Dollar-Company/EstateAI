# EstateAI 🏡🤖

> **AI-Powered Real Estate Management & Property Recommendation Platform**  
> *CSE 400 Capstone Project — Bangladesh University of Business and Technology (BUBT)*

EstateAI is a modern, high-performance real estate platform that redefines property search and management. By combining a robust CRUD real estate listings system with an **AI-powered assistant using Retrieval-Augmented Generation (RAG)**, users can buy, sell, rent, and schedule visits to properties using standard filters or natural-language conversations.

---

## 🚀 Key Highlights

*   **RAG-powered Assistant:** Conversational property suggestions with real property citations from a MongoDB Atlas Vector Search index.
*   **Role-Based Dashboards:** Distinct and personalized workspaces for Buyers/Tenants, Property Owners, and System Administrators.
*   **Virtual Tours & Cloudinary Media:** Seamless media streaming, upload, and optimization with Cloudinary.
*   **Interactive Scheduling & Negotiation:** Direct visit scheduling, reservations, purchase requests, and live offer negotiation.
*   **Production-Grade Architecture:** Type-safe development with strict TypeScript, Zod validations, robust security middleware, and comprehensive unit/integration testing.

---

## 🗺️ System Architecture

EstateAI follows a monorepo setup consisting of a client-side SPA (React) and a server-side API (Express).

```mermaid
[React SPA (Vite)] ──HTTPS/JSON──> [Express API] ──> [MongoDB Atlas]
        │                              │                 ├── collections (users, properties, bookings, reviews, conversations)
        │                              │                 └── vector index (property embeddings)
        │                              ├──> [Claude API]   (RAG generation)
        │                              ├──> [Voyage AI]    (embeddings)
        │                              └──> [Cloudinary]   (media)
        └── SSE stream for assistant chat
```

### 🧠 The RAG Pipeline

1.  **Indexing (Create/Update):**  
    When a property listing is created or updated, the system generates a canonical text block containing details like:
    ```
    Title + Description + Property Type + Location (City, Area) + Price + Specs (Beds, Baths, Size) + Amenities + Landmarks
    ```
    This text is sent to the `voyage-3` embedding model (1024 dimensions) and stored in the `property_vector_index` within MongoDB Atlas.

2.  **Query Flow (SSE Streaming Chat):**  
    *   The user sends a natural language message (e.g., *"Looking for a 3-bedroom apartment in Dhaka under 50k BDT with a balcony"*).
    *   Claude Tool-Use analyzes the conversation, extracts structured filters (city, budget, beds), and generates a vector query via Voyage AI.
    *   The backend runs a `$vectorSearch` query against MongoDB Atlas, matching on embeddings while strictly pre-filtering by listing status and extracted metadata.
    *   The retrieved properties are injected into a grounded Claude system prompt.
    *   Claude generates a response, citing real property IDs as `[P:<id>]` which the client automatically renders as interactive rich cards.
    *   The response streams back to the client using **Server-Sent Events (SSE)**.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React 18 (Vite, TypeScript)
*   **State Management:** Zustand (Client-state), TanStack Query v5 (Server-state)
*   **Styling:** Tailwind CSS + shadcn/ui component library + Lucide icons
*   **Routing:** React Router v6
*   **Mapping:** Leaflet & OpenStreetMap

### Backend (Server)
*   **Runtime:** Node.js (TypeScript) + Express
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Vector Search:** MongoDB Atlas Vector Search
*   **AI Providers:** Anthropic Claude API (Generation), Voyage AI (Embeddings)
*   **Media Hosting:** Cloudinary (Validated image/video upload)
*   **Logging:** Pino & Pino-HTTP

### Quality & Testing
*   **Testing:** Vitest, React Testing Library, Supertest (API integration tests)
*   **Linting & Formatting:** ESLint, Prettier, TypeScript Strict Mode

---

## 📂 Repository Layout

```
EstateAI/
├── client/          # React SPA (components, pages, hooks, stores, lib)
├── server/          # Express API (routes, controllers, models, services, middleware)      
├── docs/            # Architecture, Design System, Standards & Guidelines
├── plans/           # Phase-by-phase build plans (Phase 1 to Phase 9)
├── prompts/         # Reusable LLM prompting templates
└── mcp/             # Model Context Protocol setup notes
```

---

## 🔐 Key Data Models & API Surface

### Data Models
*   **User:** Handles authentication, roles (`buyer`, `owner`, `admin`), saved listings, and profile details.
*   **Property:** Contains full listing details, specs (size, beds, baths, amenities), status (`active`, `pending`, `sold`, `rented`), geo-coordinates `[lng, lat]`, and vector embeddings.
*   **Booking:** Tracks visit schedules, reservation types, and records live purchase negotiations.
*   **Review:** Stores ratings (1–5 stars) and comments (one review per user per listing).
*   **Conversation:** Stores RAG chat history and extracted user preferences.

### API Surface (Base Path: `/api/v1`)
| Resource | Primary Endpoints |
|---|---|
| **/auth** | `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /me` |
| **/properties**| `GET /` (with full filters & vector search), `POST /`, `GET/:id`, `PATCH/:id`, `DELETE/:id`, `POST/:id/media` |
| **/bookings** | `POST /`, `GET /mine`, `GET /owner`, `PATCH /:id/status`, `POST /:id/negotiate` |
| **/reviews** | `POST /properties/:id/reviews`, `GET /properties/:id/reviews`, `DELETE /reviews/:id` |
| **/users** | `GET/PATCH /me`, `POST /me/saved/:propertyId` |
| **/assistant** | `POST /chat` (SSE streaming), `GET /conversations`, `GET /conversations/:id` |
| **/admin** | `GET /stats`, `PATCH /properties/:id/approve` |

---

## ⚙️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cluster (with Atlas Vector Search capability)
*   Voyage AI & Anthropic Developer API Keys
*   Cloudinary Account

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/EstateAI.git
cd EstateAI

# Install client packages
cd client
npm install

# Install server packages
cd ../server
npm install
```

### 2. Environment Configurations
Configure the backend server by creating a `.env` file in the `server/` directory:
```bash
cd ../server
cp .env.example .env
```
Fill out the variables in `.env`:
```env
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=your_mongodb_atlas_connection_string

# Generate random bytes: node -e "console.log(crypto.randomBytes(48).toString('hex'))"
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

ANTHROPIC_API_KEY=your_anthropic_api_key
VOYAGE_API_KEY=your_voyage_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run the Applications

#### Start Backend Server
```bash
cd server
npm run dev
```
The server will boot up on `http://localhost:4000`.

#### Start Frontend Client
```bash
cd client
npm run dev
```
The client application will run on `http://localhost:5173`.

---

## 🧪 Key Script Commands

Run commands from the respective directories:

### Frontend (Client)
*   `npm run dev` — Launch Vite local development server.
*   `npm run build` — Compile TypeScript and build for production.
*   `npm run lint` — Run ESLint rules against the source tree.
*   `npm run test` — Run all client unit/component tests in Vitest.
*   `npm run typecheck` — Run TypeScript type checking.

### Backend (Server)
*   `npm run dev` — Run server in watch-mode using `tsx`.
*   `npm run build` — Build project using TypeScript.
*   `npm run start` — Run compiled server code from the `dist/` directory.
*   `npm run lint` — Run ESLint across code and scripts.
*   `npm run test` — Run all backend unit/integration tests.
*   `npm run ai-smoke` — Run RAG AI pipeline smoke tests to verify embeddings and Claude responses.

---

## 📏 Engineering & Coding Standards

*   **Strict Typing:** `any` type or `@ts-ignore` comments are strictly restricted without formal, written justification.
*   **Validation Everywhere:** Input data on the API is parsed and verified at the boundary layer using **Zod**.
*   **Thin Controllers, Thick Services:** Keep controller routes tidy—all business logic belongs strictly in service classes (`ragService`, `authService`, etc.).
*   **Graceful Degradation:** The database search is decoupled from AI services. If Voyage or Claude API is unreachable, natural keyword search falls back cleanly with user warnings.
*   **No Secrets Committed:** Environment variables are required; local configurations must reside inside `.env`.
*   **Secure Routing:** Server roles are validated before routing sensitive operations. Client-side authentication checks are treated as aesthetic UI guides.

---

## 📈 Project Roadmap

Our development lifecycle is broken down into 9 carefully structured phases:

1.  **Phase 1: Requirements Analysis:** Competitor research and functional specification definitions. *(Docs only)*
2.  **Phase 2: System Design & ERD:** Full database schema, UML modeling, and system block diagram architecture.
3.  **Phase 3: Development Setup:** Establish monorepo, environment pipelines, logging structure, and run smoke tests.
4.  **Phase 4: Frontend Foundations:** Auth flow, layouts, custom styles, and responsive visual page components.
5.  **Phase 5: Backend API Development:** Database schemas, secure routers, and robust error handlers.
6.  **Phase 6: AI Integration (RAG):** Integrate Voyage embedding generation and MongoDB Atlas vector queries with streaming Claude recommendations.
7.  **Phase 7: Integration & End-to-End Testing:** Cross-boundary API testing, user role verification, and performance audits.
8.  **Phase 8: Production Deployment:** Automating deployments via Vercel (frontend), Render (backend), and configuring Atlas production indices.
9.  **Phase 9: Maintenance & Report:** Documenting bugs, analyzing costs, and finishing the capstone project paper.

---

## 📜 License & Acknowledgments

This project is authored as part of the CSE 400 Capstone requirement at **Bangladesh University of Business and Technology (BUBT)**. All rights are reserved by the capstone project members and BUBT. See `docs/` for specific architectural blueprints.
