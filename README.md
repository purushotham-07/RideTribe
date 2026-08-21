# RideTribe — Weekend Group Ride Matcher (Bangalore)

RideTribe is a full-stack web application designed for Bangalore solo riders (bikers and drivers) heading to popular weekend destinations (such as Nandi Hills, Coorg, Chikmagalur, Lepakshi, Skandagiri, and Wayanad). The application matches solo riders into compatible peer groups of 3 to 6 members using a Greedy Graph Clustering algorithm (Union-Find) and provides real-time convoy tracking, safety alerts, and post-ride peer ratings.

---

## Key Features

1. **Ride Intent Posting**:
   - Post weekend ride intentions with destination, date, start/end time windows, travel mode (Bike vs Car), and riding pace.
   - Categorized by destination and Bangalore starting origin.

2. **Group Matching Engine (Algorithmic Core)**:
   - **Candidate Pool Partitioning**: Partitions pending intents by destination, date, and travel mode.
   - **Pairwise Compatibility Scoring**: Computes compatibility (0–100%) based on time window overlap duration (50%), pace alignment (25%), origin area proximity (15%), and past peer rating history (10%).
   - **Greedy Graph Clustering with Disjoint Set (Union-Find)**: Sorts compatibility edges descending and greedily clusters nodes into groups while enforcing safety bounds ($3 \le \text{group size} \le 6$).
   - **Bangalore Rendezvous Assignment**: Automatically assigns optimal highway checkpoints (e.g. Hebbal Esteem Mall for Nandi Hills/Lepakshi, Nelamangala Toll for NH 48/Coorg/Chikmagalur, NICE Road/Kengeri for Mysore Road).
   - **On-Demand & Scheduled Execution**: Run manually via REST endpoint `POST /api/matching/run` or automated cron scheduled for Fridays at 6:00 PM (`@Scheduled(cron = "0 0 18 * * FRI")`).

3. **Pre-Ride Meetup Coordination**:
   - Group confirmation screen with rendezvous checkpoint map pin.
   - Member roster with vehicles, rating stars, and emergency contact verification.
   - "On My Way" status toggle to notify the convoy during the 30-minute pre-ride window.

4. **Live Convoy Tracking (WebSockets)**:
   - Real-time location streaming via Spring STOMP WebSockets (`/ws`) scoped to ride group rooms (`/topic/ride-groups/{groupId}/locations`).
   - Clean Leaflet OpenStreetMap with custom rider markers, current speed in km/h, and distance from lead rider.

5. **Regroup Checkpoint Alerts**:
   - Automatic Haversine distance evaluation between convoy members and the lead rider/cluster.
   - Emits a Regroup alert (`/topic/ride-groups/{groupId}/regroup-alert`) if any rider separates by $> 2.0\text{ km}$.

6. **One-Tap Emergency SOS**:
   - Real-time emergency beacon broadcast (`/topic/ride-groups/{groupId}/sos-alert`).
   - Server-side safety audit logging in PostgreSQL.
   - Displays stored emergency family contact number and GPS coordinates with direct map link.

7. **Post-Ride Peer Ratings**:
   - 1–5 star ratings, "Would ride with again" toggle (which boosts future compatibility scores), and strength badges.

8. **Theme Support**:
   - Clean, engineer-focused Dark and Light mode toggle with persistent state.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet, React-Leaflet, `@stomp/stompjs`, `sockjs-client`, `lucide-react` |
| **Backend** | Java 17+, Spring Boot 3.2.5, Spring WebSocket (STOMP), Spring Security 6, JJWT 0.12.5, Spring Data JPA |
| **Database** | PostgreSQL (Production / Render) with H2 in-memory fallback for local development |
| **Deployment** | Vercel (Frontend SPA) & Render (Backend Web Service + Managed PostgreSQL) |

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── main/java/com/ridetribe/
│   │   │   ├── config/             # WebSocketConfig, SecurityConfig, DatabaseSeeder
│   │   │   ├── controller/         # Auth, RideIntent, Matching, RideGroup, Telemetry, SOS, Ratings
│   │   │   ├── dto/                # Request and Response transfer objects
│   │   │   ├── model/              # User, RideIntent, RideGroup, RideGroupMember, Rating, SosEvent
│   │   │   ├── repository/         # Spring Data JPA repositories
│   │   │   ├── security/           # JwtUtils, AuthTokenFilter, UserDetailsServiceImpl
│   │   │   └── service/            # MatchingEngineService, TelemetryService, SosService, RatingService
│   │   └── test/java/com/ridetribe/ # MatchingEngineServiceTest (Union-Find & Compatibility tests)
│   ├── Dockerfile                  # Multi-stage production container build
│   ├── mvnw.cmd & mvnw             # Self-bootstrapping Maven wrappers
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # REST API client
│   │   ├── components/             # Navbar, BangaloreMap, LiveSimulatorControl, SosAlertModal, etc.
│   │   ├── context/                # AuthContext, ThemeContext
│   │   ├── data/destinations.js    # Curated Bangalore destinations & route coordinates
│   │   ├── hooks/useRideWebSocket.js # STOMP client hook
│   │   └── pages/                  # AuthPage, PostIntentPage, MyRidesPage, GroupConfirmationPage, LiveRidePage, PostRideRatingPage
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── render.yaml                     # Render Blueprint for backend + database
└── README.md
```

---

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Java JDK (17+)

### 1. Run the Spring Boot Backend

```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run

# Linux / macOS:
./mvnw spring-boot:run
```

*The backend will automatically start on `http://localhost:8080` with in-memory H2 database, seeded with Bangalore test riders and sample intents.*

### 2. Run the React Frontend

```bash
cd frontend
npm install
npm run dev
```

*Open `http://localhost:5173` in your browser.*

### 3. Run Backend Unit Tests

```bash
cd backend
.\mvnw.cmd test
```

---

## Deployment Guide

### Deploying Backend to Render
1. Push repository to GitHub.
2. In Render Dashboard, click **New > Blueprint** and select this repo (it reads `render.yaml`).
3. Render will provision:
   - Managed PostgreSQL database (`ridetribedb`).
   - Web Service running `backend/Dockerfile` with WebSockets enabled.
4. Set environment variable on Render if desired:
   - `JWT_SECRET`: (generated automatically or your custom secret)

### Deploying Frontend to Vercel
1. In Vercel, click **Add New Project** and import this repository.
2. Set **Root Directory** to `frontend`.
3. Set Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://ridetribe-backend.onrender.com`)
   - `VITE_WS_URL`: Your Render WebSocket URL (e.g. `https://ridetribe-backend.onrender.com/ws`)
4. Click **Deploy**.
