# RideTribe — System Architecture, Data Flow & Technical Design Document

---

## 1. Executive Summary & System Overview

**RideTribe** is a full-stack, real-time community convoy and weekend tour matching platform tailored for motorcycle riders and car enthusiasts. The system facilitates trip hosting, discovery, applicant management, live turn-by-turn road navigation, real-time GPS telemetry, group radio comms, emergency SOS beacons, and post-ride peer rating.

```mermaid
graph TD
    Client["Client Layer (React 18 + Vite + Tailwind + Leaflet)"]
    API_GW["Spring Security & JWT Filter"]
    Controllers["REST Controllers & STOMP WebSocket Handlers"]
    Services["Service Layer (Trip, LiveTelemetry, MatchingEngine, SOS, Rating)"]
    DB[(Database: MongoDB)]
    External["External Integrations (OSRM Routing, Google OAuth, Cloudinary, Open-Meteo)"]

    Client -->|HTTP / REST| API_GW
    Client <-->|WebSocket / STOMP| Controllers
    API_GW --> Controllers
    Controllers --> Services
    Services --> DB
    Services <--> External
```

---

## 2. Technology Stack & Component Topology

| Layer | Technologies & Frameworks | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide Icons, Space Grotesk / Inter fonts | Responsive mobile-first Highway HUD, Bottom tab navigation, Sheet modals |
| **Interactive Maps** | Leaflet, React-Leaflet, OSRM Routing API, Esri Satellite, CartoDB | Precision 3-layer turn-by-turn road polyline, multi-layer cartography, custom SVG pins |
| **Real-Time Streaming** | SockJS, `@stomp/stompjs`, HTML5 Geolocation API | Continuous browser GPS broadcasting, live group chat, SOS siren & telemetry radar |
| **Backend Core** | Spring Boot 3.2.x (Java 17/21), Spring Data MongoDB | Business logic, transaction orchestration, REST API, WebSocket broker |
| **Security & Auth** | Spring Security 6, JJWT (0.12.x), Google OAuth 2.0 | Stateless JWT authentication, role authorization, BCrypt encryption |
| **Database & ODM** | MongoDB (`spring-boot-starter-data-mongodb`), Document Collections | Document persistence, atomic embedded subdocument updates, scalable GPS time-series |
| **External Cloud Services** | Open Source Routing Machine (OSRM), Cloudinary, Open-Meteo | Highway road geometry calculations, cloud asset storage, weather telemetry |

---

## 3. Domain Data Models & Database Schema

```mermaid
erDiagram
    USERS ||--o{ RIDE_GROUPS : "hosts (embedded members & requests)"
    USERS ||--o{ TRIP_CHAT_MESSAGES : sends
    USERS ||--o{ RIDE_INTENTS : posts
    USERS ||--o{ PEER_RATINGS : rates
    USERS ||--o{ RIDE_TELEMETRY : streams
    
    RIDE_GROUPS ||--o{ TRIP_CHAT_MESSAGES : contains
    RIDE_GROUPS ||--o{ SOS_EVENTS : triggers
    RIDE_GROUPS ||--o{ RIDE_TELEMETRY : tracks

    USERS {
        String id PK "ObjectId"
        String name
        String email UK
        String password
        String phone
        String gender
        Integer age
        String avatarUrl
        String preferredMode
        String vehicleModel
        String vehicleNumber
        String vehiclePhotoUrl
        String emergencyContactName
        String emergencyContactPhone
        Double avgRating
        Integer totalRatings
        Integer ridesCompleted
        String bio
        LocalDateTime createdAt
    }

    RIDE_GROUPS {
        String id PK "ObjectId"
        String title
        String description
        String destination
        String travelMode
        LocalDate rideDate
        LocalTime scheduledTime
        Integer numberOfDays
        Integer maxMembers
        String whatToCarry
        String coverImageUrl
        String meetingPointName
        Double meetingPointLat
        Double meetingPointLng
        Double destinationLat
        Double destinationLng
        Double estimatedDistanceKm
        String status
        User hostUser
        List_RideGroupMember members "Embedded Subdocuments"
        List_TripJoinRequest requests "Embedded Subdocuments"
        LocalDateTime startedAt
        LocalDateTime completedAt
        LocalDateTime createdAt
    }

    RIDE_GROUP_MEMBERS {
        String id "Subdocument ID"
        User user
        Boolean isLead
        Boolean onMyWay
        Double currentLat
        Double currentLng
        Double currentSpeed
        Double currentHeading
        LocalDateTime lastLocationUpdate
        LocalDateTime joinedAt
    }

    TRIP_JOIN_REQUESTS {
        String id "Subdocument ID"
        String tripId
        User user
        String message
        String status
        LocalDateTime createdAt
        LocalDateTime respondedAt
    }

    TRIP_CHAT_MESSAGES {
        String id PK "ObjectId"
        String tripId FK
        User sender
        String content
        LocalDateTime sentAt
    }

    RIDE_INTENTS {
        String id PK "ObjectId"
        String userId FK
        User user
        String destination
        String travelMode
        String pace
        LocalDate rideDate
        LocalTime windowStartTime
        LocalTime windowEndTime
        String startingArea
        String notes
        String status
        LocalDateTime createdAt
    }

    SOS_EVENTS {
        String id PK "ObjectId"
        String rideGroupId FK
        String userId FK
        User user
        Double lat
        Double lng
        String notes
        Boolean resolved
        LocalDateTime createdAt
        LocalDateTime resolvedAt
    }

    RIDE_TELEMETRY {
        String id PK "composite: groupId_userId"
        String rideGroupId FK
        String userId FK
        Double lat
        Double lng
        Double speed
        Double heading
        Boolean onMyWay
        Boolean isLead
        LocalDateTime timestamp
    }
```

---

## 4. End-to-End Data Flows & System Sequence Diagrams

### Flow A: Community Trip Creation & Join Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Host as Trip Host
    actor Rider as Convoy Applicant
    participant Frontend as React Client
    participant Controller as TripController
    participant Service as TripService
    participant DB as Relational DB
    participant WS as STOMP Broker

    Host->>Frontend: Fill Host Form (Destination, Date, Pinpoint Meeting Location, Packing List)
    Frontend->>Controller: POST /api/trips
    Controller->>Service: createTrip(payload, hostUser)
    Service->>DB: INSERT into RIDE_GROUPS & RIDE_GROUP_MEMBERS (Lead)
    DB-->>Frontend: Return TripDTO (Status: FORMING)

    Rider->>Frontend: Browse Explore Dashboard & Click "Send Request to Join"
    Frontend->>Controller: POST /api/trips/{id}/join-requests
    Controller->>Service: sendJoinRequest(tripId, requestDto)
    Service->>DB: INSERT into TRIP_JOIN_REQUESTS (Status: PENDING)
    DB-->>Frontend: Request Awaiting Approval

    Host->>Frontend: Open "Manage Join Requests" Tab
    Host->>Frontend: Click "Accept" on Applicant
    Frontend->>Controller: PATCH /api/trips/{id}/join-requests/{reqId} (APPROVED)
    Controller->>Service: respondToJoinRequest(APPROVED)
    Service->>DB: Update Request + INSERT into RIDE_GROUP_MEMBERS
    opt Capacity Reached (currentMembers == maxMembers)
        Service->>DB: UPDATE RIDE_GROUPS SET status = 'CONFIRMED'
    end
    DB-->>Host: Real-Time UI Update
```

---

### Flow B: Live Device GPS Telemetry & Real-Time Convoy Map

```mermaid
sequenceDiagram
    autonumber
    actor Rider as Convoy Member
    participant GPS as Browser Geolocation API
    participant Hook as useLiveGeolocation
    participant ClientWS as useRideWebSocket
    participant Broker as Spring STOMP Broker (/topic/ride-groups/{id}/locations)
    participant PeerClient as Peer Rider Map

    Rider->>Hook: Enter Live Ride Cockpit (Permission Granted)
    Hook->>GPS: navigator.geolocation.watchPosition()
    GPS-->>Hook: LatLng [12.9716, 77.5946], Speed: 78 km/h, Heading: 45°
    Hook->>ClientWS: sendLocation({lat, lng, speed, heading})
    ClientWS->>Broker: SEND /app/ride-groups/{groupId}/location
    Broker->>Broker: Calculate Group Lead, Lagging Detection (>2.0 km)
    Broker-->>PeerClient: BROADCAST /topic/ride-groups/{groupId}/locations
    PeerClient->>PeerClient: Update Leaflet Marker Positions, Radar Pings & Speedometer HUD
```

---

### Flow C: OSRM High-Precision Road Geometry Routing

```mermaid
sequenceDiagram
    autonumber
    participant Map as BangaloreMap (Leaflet)
    participant OSRM as OSRM Public Driving Router
    
    Map->>OSRM: GET /route/v1/driving/{meetLng},{meetLat};{destLng},{destLat}?overview=full&geometries=geojson
    OSRM-->>Map: GeoJSON LineString (Hundreds of Road Curve Nodes, Distance Meters, Duration Sec)
    Map->>Map: Transform [lng, lat] -> Leaflet [lat, lng]
    Map->>Map: Render 3-Layer Polyline (Outer Casing + Electric Blue Highway + Progress Highlight)
    Map->>Map: MapBoundsFitter.fitBounds(roadPoints)
    Map->>Map: Display Distance (km) & Driving ETA (hrs/mins) in Header Card
```

---

### Flow D: Emergency SOS Beacon Alarm Flow

```mermaid
sequenceDiagram
    autonumber
    actor Distressed as Distressed Rider
    participant Cockpit as Live Ride Cockpit
    participant Backend as Spring Boot SOS Service
    participant Broker as STOMP Broker
    participant AllRiders as All Convoy Members

    Distressed->>Cockpit: Press Red "SOS BEACON" Button
    Cockpit->>Backend: POST /api/ride-groups/{id}/sos
    Backend->>Backend: INSERT into SOS_EVENTS (Audit Log)
    Backend->>Broker: SEND /topic/ride-groups/{id}/sos-alert
    Broker-->>AllRiders: High-Priority Siren Popup & Audio Alert
    AllRiders->>AllRiders: Red Pulsing Marker on Map with Exact GPS & Coordinates
    Note over AllRiders: Lead/Host can mark SOS Resolved once rider is assisted
```

---

## 5. Comprehensive REST API & WebSocket Specifications

### 5.1 Authentication & Profile APIs
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new rider with email, password, bio, vehicle details |
| `POST` | `/api/auth/login` | Public | Authenticate rider and receive signed JWT token |
| `POST` | `/api/auth/google` | Public | One-tap Google OAuth 2.0 login / account auto-provisioning |
| `GET` | `/api/auth/me` | Authenticated | Fetch current rider profile, ratings, vehicle info |
| `PUT` | `/api/auth/profile` | Authenticated | Update bio, emergency contacts, avatar, vehicle photos |

### 5.2 Community Trips & Convoy Lifecycle APIs
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | Public | Retrieve all community hosted trips with filters |
| `GET` | `/api/trips/{id}` | Public | Retrieve complete trip details, packing list, meeting pin |
| `POST` | `/api/trips` | Authenticated | Host a new trip (destination, date, days, member limit, packing tags) |
| `DELETE` | `/api/trips/{id}` | Host Only | Permanently cancel and delete hosted trip and associated records |
| `POST` | `/api/trips/{id}/join-requests` | Authenticated | Send a join request with an optional note to the trip host |
| `GET` | `/api/trips/{id}/join-requests` | Host Only | View pending join requests and rider profiles |
| `PATCH` | `/api/trips/{id}/join-requests/{reqId}` | Host Only | Accept (`APPROVED`) or Decline (`REJECTED`) an applicant |
| `GET` | `/api/trips/{id}/chat` | Members/Host | Fetch persistent trip group chat history |
| `POST` | `/api/trips/{id}/chat` | Members/Host | Send message or preset shout (Broadcasted via WebSocket) |

### 5.3 Live Convoy Cockpit, Telemetry & Safety APIs
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ride-groups/{id}/start` | Lead/Host | Transition trip status from `CONFIRMED` to `IN_PROGRESS` |
| `POST` | `/api/ride-groups/{id}/complete` | Lead/Host | Mark ride `COMPLETED` and transition to post-ride rating |
| `GET` | `/api/ride-groups/{id}/locations` | Members/Host | Fetch latest snapshot of all convoy rider positions |
| `POST` | `/api/ride-groups/{id}/telemetry` | Members/Host | Send REST location update fallback |
| `POST` | `/api/ride-groups/{id}/sos` | Members/Host | Broadcast emergency SOS beacon with GPS coordinates |
| `POST` | `/api/ride-groups/sos/{sosId}/resolve` | Lead/Host | Resolve active SOS emergency |

### 5.4 WebSocket Channels (STOMP Protocol)
| Destination Channel | Type | Payload Schema | Purpose |
| :--- | :--- | :--- | :--- |
| `/topic/trips/{tripId}/chat` | Subscribe | `TripChatMessageDTO` | Real-time group chat and quick shouts |
| `/topic/ride-groups/{groupId}/locations` | Subscribe | `GroupLocationStateDTO` | Live highway radar positions & speeds of all riders |
| `/topic/ride-groups/{groupId}/sos-alert` | Subscribe | `SosAlertDTO` | High-priority SOS siren popups |
| `/topic/ride-groups/{groupId}/regroup-alert` | Subscribe | `RegroupAlertDTO` | Auto-triggered when member lags > 2.0 km behind lead |
| `/app/ride-groups/{groupId}/location` | Publish | `LocationPingDTO` | Ingests rider satellite lat/lng, velocity, heading |
| `/app/ride-groups/{groupId}/sos` | Publish | `SosTriggerDTO` | Ingests SOS beacon trigger |

---

## 6. Frontend Component & Module Hierarchy

```
frontend/src/
├── api/
│   └── client.js                      # Axios/Fetch client with JWT interceptor & API methods
├── context/
│   ├── AuthContext.jsx                # Global user state, JWT persistence, login/logout
│   ├── ThemeContext.jsx               # Dark/Light mode theme provider
│   └── ToastContext.jsx               # Floating banner alert notifications
├── hooks/
│   ├── useLiveGeolocation.js          # HTML5 watchPosition continuous GPS tracker
│   └── useRideWebSocket.js            # SockJS & STOMP subscription manager
├── components/
│   ├── Navbar.jsx                     # Top navigation bar & mobile navigation
│   ├── BangaloreMap.jsx               # Precision Leaflet map with OSRM routing & HUD
│   ├── MeetingPinMapPicker.jsx        # Interactive draggable meetup pin-point selector
│   ├── HostTripModal.jsx              # Trip hosting form with packing checklist builder
│   ├── TripDetailsModal.jsx           # Trip overview, join request & host applicant manager
│   ├── TripChatModal.jsx              # Dedicated group chat with quick shouts
│   ├── LiveGpsBadgeControl.jsx        # Live satellite lock status & mode switcher
│   ├── ConvoyRadioChat.jsx            # In-cockpit walkie-talkie quick comms
│   ├── PreRideSafetyChecklist.jsx     # Pre-departure vehicle & gear inspection
│   └── DestinationWeatherWidget.jsx   # Live weather forecasts at trip destination
└── pages/
    ├── ExploreTripsPage.jsx           # Community discovery dashboard
    ├── LiveRidePage.jsx               # Live Convoy Cockpit (Map, HUD, Radio, SOS)
    ├── MyRidesPage.jsx                # Matched groups, pending pool, and completed rides
    ├── PostIntentPage.jsx             # Algorithmic matchmaking pool entry
    ├── ProfilePage.jsx                # Rider profile & vehicle photo management
    ├── GroupConfirmationPage.jsx      # Pre-ride briefing & meetup coordinates
    ├── PostRideRatingPage.jsx         # Peer rating & post-ride review
    └── NotFoundPage.jsx               # Branded 404 Highway route not found page
```

---

## 7. Security & Authentication Architecture

1. **Stateless JWT Tokens**:
   - Every API request carries a `Bearer <token>` in the HTTP `Authorization` header.
   - Tokens are signed with HMAC-SHA-256 and verified via `AuthTokenFilter`.
2. **Spring Security Filter Chain**:
   - Public GET access permitted for browsing trips on Explore Dashboard (`/api/trips`, `/api/trips/**`).
   - Mutations (`POST`, `PATCH`, `DELETE`) strictly guarded by `isAuthenticated()`.
   - Host-only operations validated against `trip.getHostUser().getId()`.
3. **Google OAuth 2.0 Integration**:
   - Pop-up OAuth flow directly verifies Google tokens and provisions or links user accounts seamlessly.

---

## 8. Development & Production Deployment Guide

### Local Development Setup
```bash
# 1. Backend (Spring Boot 3 + Spring Data MongoDB)
cd backend
./mvnw.cmd spring-boot:run
# Runs on http://localhost:8080 (Connected to mongodb://localhost:27017/ridetribedb)

# 2. Frontend (Vite + React 18 + Tailwind)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Production Environment Variables (`.env`)
```env
# Frontend (.env)
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com/ws
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Backend (application-prod.properties / Environment)
SPRING_DATA_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ridetribedb?retryWrites=true&w=majority
JWT_SECRET=your_256_bit_secure_random_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
