<div align="center">
  <img src="https://raw.githubusercontent.com/TachibanaSugu/thesis-app/master/public/favicon.ico" alt="PCpartSmart Logo" width="120" />
</div>

# ⚡ PCpartSmart 
### Agentic PC Building & Hardware Engineering Suite

**PCpartSmart** is a comprehensive, production-grade e-commerce aggregator and hardware engineering suite developed as a Capstone/Thesis Project. It aims to solve the intense barrier of entry in PC building by utilizing cutting-edge Agentic AI to recommend, validate, and simulate complex hardware interactions.

---

## 🎯 Thesis Objectives
1. **Agentic System Architecture**: Implement Google's Gemini 2.0 AI to act as an autonomous consultant that parses user budgets and requirements to instantly generate complete, highly-optimized hardware arrays.
2. **Computational Hardware Engineering Validation**: Develop a heuristic compatibility engine to prevent catastrophic hardware mismatches (e.g., LGA 1700 CPUs with AM5 motherboards) and perform real-time systemic power draw (Wattage) monitoring.
3. **Data Aggregation Simulation**: Recreate a unified PC hardware marketplace aggregating pricing intelligence data.
4. **Performance Simulation**: Simulate real-time FPS thresholds for 1080p, 1440p, and 4K gaming parameters based on GPU/CPU telemetry.

---

## 🚀 Key Features

### 🧠 The "Auto-Builder" Agent
A specialized Gemini Flash-powered agent that takes natural language (e.g., "Build me a 4K editing rig for $1500") and instantly returns an expert-curated shopping cart, explaining *why* it chose each component.

### ⚠️ Strict Compatibility & Safety Engine
- Parses the active cart in massive arrays.
- Triggers UI-blocking logic if cross-socket components are mismatched (Intel CPUs on AMD Motherboards).
- **Smart Wattage Engine**: Calculates maximum potential load vs active Power Supply Unit (PSU) capacity. Disables the checkout process if a dangerous load ratio (>90%) is detected.

### 💳 Complete E-Commerce Lifecycle
- **Unified Profile Hub**: A secure User Account interface handling robust state synchronization for Order Histories, cloud-synced Saved Builds, and component Wishlists.
- **Simulated Payment Gateways**: Intercepts checkouts with interactive GCash and Maya animated modals, generating dynamic secure digital receipts.
- **PDF Export Engine**: Synthesizes the active complex build into an exportable, highly-formatted offline tracking document.

### 🔐 Secure Multi-Role Architecture (CMS)
Features a deeply integrated Admin Dashboard exclusively accessible via `admin@pcpartsmart.com`. It bypasses static rendering to securely load real-world inventory mapping, order status manipulation (Processing to Delivered), and graphical revenue analytics.

---

## 🛠️ Technology Stack
*   **Framework**: Next.js 16 (React, App Router, Turbopack)
*   **Database**: MongoDB (`thesis_database`) with native NoSQL operations
*   **Authentication**: Secure Route Protection with `bcrypt` password hashing
*   **Styling**: Tailwind CSS & Framer Motion for glassmorphism and kinematic animations
*   **Artificial Intelligence**: Google Gemini `gemini-2.0-flash` API

---

## 💻 Local Development Setup

Clone the repository and install the dependencies to run the build suite locally.

```bash
# 1. Clone the repo
git clone https://github.com/TachibanaSugu/thesis-app.git
cd thesis-app

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Create a .env.local file in the root directory:
# MONGODB_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key

# 4. Start the application
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the hardware suite.

---

## 🎓 Academic Statement
This application was synthesized, iteratively developed, and deployed to demonstrate proficiency in Modern Full-Stack web architecture, NoSQL database engineering, state synchronization, and LLM Agentic integrations. It stands as the final capstone deliverable for academic validation.
