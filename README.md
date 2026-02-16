# DevoteMe-API

DevoteMe-API is a robust backend platform designed to help people connect with the Gospel through digital tools. It serves as the central data and service provider for the DevoteMe application suite, primarily focused on delivering daily spiritual content and managing multi-tenant configurations.

## Features Overview

### 📖 Daily Devotionals
The API provides a comprehensive daily devotional service that scrapes content from **Vision Christian Media ("The Word For Today")**.
- **Source**: `https://vision.org.au/read/bible-study/the-word-for-today/`
- **Data Extracted**:
  - **Title**: The main topic of the day.
  - **Reading**: A theme verse or scripture passage that sets the tone.
  - **Content**: The full devotional text, delivered as an array of paragraphs for flexible formatting.
  - **Bible in One Year (SoulFood)**: A daily reading plan to help users read through the Bible.
- **Technical Heuristics**: Uses advanced Cheerio selectors and User-Agent spoofing (`facebookexternalhit/1.1`) to ensure reliable data extraction and bypass anti-bot protections.

### 📜 Verse of the Day (VOTD)
Delivers a fresh scripture verse every day, integrated with **Bible Gateway**.
- **Source**: Bible Gateway Atom Feed.
- **Processing**:
  - Automatically removes HTML entities and clutter for a clean reading experience.
  - Provides the scripture reference, a direct link to the passage, and the verse content.

### 🤖 Discord Optimization
The API is specifically tuned for Discord integration:
- **Dynamic Timestamps**: All dates are returned in Discord's Unix timestamp markdown format (`<t:TIMESTAMP:D>`). This allows the Discord client to automatically format the date according to the user's local timezone and preferred date format.

### 🏢 Multi-Tenant Management
Designed to support multiple organizations or Discord servers simultaneously.
- **Independent Configuration**: Each tenant can specify different Discord channels for VOTD and Devotional broadcasts.
- **Interaction Tracking**: Tracks which users have interacted with specific devotions or verses across different tenants.

### ⚡ Prayer Tracking
Infrastructure to support prayer requests and tracking interactions, helping communities stay connected in prayer.

## Technical Architecture

### Prerequisites
- **Node.js**: >=20.18.1 (ES Modules)
- **Database**: MySQL 8.x
- **Framework**: Fastify

### Database Schema
The system uses a relational MySQL schema to manage data:
- `tenants`: Stores unique tenant IDs and names.
- `tenantConfiguration`: Stores channel settings for each tenant.
- `devotions`: Tracks user interactions with daily devotions.
- `votd`: Tracks user interactions with the Verse of the Day.
- `prayers`: Stores prayer request interactions.

### Authentication
Security is enforced for all `/api/` endpoints using an `x-access-token` header. This token must match the `APIKEY` defined in the server's environment variables.

## Getting Started

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database using `dbinit.sql`.
4. Configure environment variables in a `.env` file:
   ```env
   PORT=8080
   APIKEY=your_secure_key
   DBHOST=localhost
   DBUSER=root
   DBPASSWORD=your_password
   DBNAME=devoteMe
   ```

### Running the App
- **Development**: `npm run dev` (uses nodemon)
- **Production**: `npm run prod` (optimized for performance)

## API Reference

### Public Endpoints
- `GET /devotion/get`: Returns the current scraped devotion.
- `GET /votd/get`: Returns the current Verse of the Day.

### Administrative API (`/api/tenant`)
- `GET /api/tenant/get`: List all tenants or get one by ID.
- `POST /api/tenant/create`: Register a new tenant.
- `POST /api/tenant/update`: Update configuration (VOTD/Devotion channels).

### Interaction API
- `GET /api/devotion/check`: Verify if a user has read a devotion.
- `POST /api/devotion/add`: Log a devotion interaction.
- `GET /api/votd/check`: Verify if a user has read a VOTD.
- `POST /api/votd/add`: Log a VOTD interaction.

---
**Learn more about DevoteMe on our [website](https://modularsoft.org/docs/products/devoteMe/)**
