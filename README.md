# Trayana - README
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

##  Overview
This project is a **real-time disaster response and resource management system** leveraging AI and cloud technologies. It enables **victims, government agencies, and partner organizations** to coordinate during disasters via multi-channel communication and automated resource allocation.

##  Tech Stack
| Component           | Technology Used |
|-------------------|----------------|
| **Frontend**      | React Native (Mobile), Next.js (Web), TailwindCSS |
| **Backend**       | Node.js, Express.js, Supabase (PostgreSQL, Realtime DB) |
| **AI & ML**       | Google Gemini AI, Vertex AI Forecasting,  BigQuery |
| **Communication** | Supabse Push, Twilio SMS, Supabase Realtime, Websocket |
| **Geolocation**   | Google Maps API, GPS Tracking |
| **Database**      | Supabase, BigQuery |
| **APIs**          | IMD, USGS Earthquake, Google Maps, Google Cloud Translation, Google Sheets, Google Flood Forecasting, Google Earth, Google Earth Engine, Compute Engine API |
| **Code Editor**   | IDX, VS Code | 


##  Features
###  **Core Features**
 **Real-time Disaster Alerts** (SMS, Realtime (for Partner Organizations), Social Media Monitoring)  
 **SOS Emergency Requests** (AI-powered urgency detection via Gemini AI)  
 **Offline Mode** (Locally stores distress messages, syncs once online)  
 **Multi-Channel Communication** (Mobile app, SMS, IVR for illiterate users)  
 **AI Resource Matching & Allocation** (Google Gemini AI)  
 **Geolocation Tracking** (Rescue teams & victims via Google Maps API)  
 **Data Dashboards** (Live response monitoring via Google Data Studio)  

##  Installation & Setup
1️. Clone the repository:  
```bash
   git clone https://github.com/PoTaTo-boy-00/Trayana.git
```
2️. Install dependencies:  
```bash
   cd Trayana
   npm install
```
3️. Set up **Supabase environment variables** in `.env.local`  
4️. Run the development server:  
```bash
   npm run dev
```

## Admin & Partner Login Credentials
For testing purposes, use the following credentials:

### Admin Login
- Email: admin@gmail.com

- Password: admin2005

### Partner Login
- Email: abcde@gmail.com

- Password: 123456

## 📡 API Endpoints
###  **SOS Alerts**
- `POST /api/sos` – Submit an SOS request
- `GET /api/sos` – Fetch active distress signals

###  **Resource Management**
- `POST /api/resources` – Allocate resources
- `GET /api/resources` – View available resources

###  **Notifications & Alerts**
- `POST /api/alerts` – Broadcast disaster warnings
- `GET /api/alerts` – Retrieve active alerts

##  Security & Authentication
- **Supabase Authentication** for role-based access (Admin, Partner)
- **AES-256 & TLS Encryption** for secure data transmission

## 🛠️ Future Enhancements
-  AI-based speech-to-text for emergency reporting
-  Blockchain-based transparent resource tracking
-  Machine learning for disaster prediction refinement

##  Contribution Guidelines
1️. Fork the repository  
2️. Create a new branch (`feature-branch`)  
3️. Commit your changes  
4️. Submit a pull request 

## 📩 Contact
For queries, reach out at: `ad2719@cse.jgec.ac.in` or `mk2714@cse.jgec.ac.in`

