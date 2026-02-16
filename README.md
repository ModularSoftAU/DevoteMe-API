# DevoteMe-API

DevoteMe-API is a platform that aims to help people connect with the Gospel in a more accessible way. It serves as the backend for the DevoteMe application suite, providing daily devotionals and prayer-related functionalities.

## Features

- **Daily Devotionals**: Scraped from Vision Christian Media ("The Word For Today").
- **Verse of the Day (VOTD)**: Fetched from Bible Gateway.
- **Discord Integration**: Dates are formatted using Discord Unix timestamp markdown for dynamic display.
- **Tenant Management**: Support for multiple tenants (e.g., different Discord servers) with custom configurations.

## Getting Started

### Prerequisites

- Node.js (>=20.18.1)
- MySQL Database

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your database credentials and API key.

### Running the Application

- **Development**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm run prod
  ```

## API Documentation

All API routes under `/api/` require an `x-access-token` header for authentication, which should match the `APIKEY` set in your `.env` file.

### Public Endpoints

#### `GET /`
Displays basic information about the API.

#### `GET /devotion/get`
Fetches the latest daily devotion from Vision Christian Media.
- **Response**:
  ```json
  {
    "title": "String",
    "date": "<t:TIMESTAMP:D>",
    "reading": "String",
    "content": ["String"],
    "bibleInOneYear": "String",
    "credit": "String"
  }
  ```

#### `GET /votd/get`
Fetches the latest Verse of the Day from Bible Gateway.
- **Response**:
  ```json
  {
    "reference": "String",
    "referenceLink": "String",
    "date": "<t:TIMESTAMP:D>",
    "content": "String",
    "credit": "String"
  }
  ```

### Tenant API (`/api/tenant`)

#### `GET /api/tenant/get`
Retrieves tenant information.
- **Query Params**: `id` (optional) - The ID of the tenant to retrieve.

#### `GET /api/tenant/configuration/get`
Retrieves configuration for a specific tenant.
- **Query Params**: `id` (required) - The ID of the tenant.

#### `POST /api/tenant/create`
Creates a new tenant and its default configuration.
- **Body (JSON)**: `tenantId`, `tenantName`

#### `POST /api/tenant/update`
Updates tenant configuration (e.g., notification channels).
- **Body (JSON)**: `tenantId`, `votd_channel` (optional), `devotion_channel` (optional)

### Devotion API (`/api/devotion`)

#### `GET /api/devotion/check`
Checks if a devotion record exists for a specific user and tenant.
- **Query Params**: `tenantId`, `messageId`, `userId`

#### `POST /api/devotion/add`
Adds a new devotion entry to the database.
- **Body (JSON)**: `tenantId`, `messageId`, `userId`

### VOTD API (`/api/votd`)

#### `GET /api/votd/check`
Checks if a VOTD record exists.
- **Query Params**: `tenantId`, `messageId`, `userId`

#### `POST /api/votd/add`
Adds a new VOTD entry to the database.
- **Body (JSON)**: `tenantId`, `messageId`, `userId`

---
**Learn more about DevoteMe on our [website](https://modularsoft.org/docs/products/devoteMe/)**
