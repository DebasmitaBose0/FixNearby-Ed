# Architecture Overview

This document describes the high-level architecture of FixNearby.

## System Diagram

```mermaid
graph TD
    Client[React/Vite Client] -->|HTTPS| LoadBalancer[Nginx/Vercel Router]
    LoadBalancer --> API[Express API Server]
    API -->|NoSQL Queries| DB[(MongoDB Database)]
    API -->|Caching| Cache[(Redis Cache Server)]
    API -->|Mailing| Brevo[Brevo SMTP Gateway]
```

## Data Request Pipeline

Every incoming request to the server passes through the following secure pipeline stages before reaching the controller logic:

```mermaid
sequenceDiagram
    participant Client
    participant Sanitizer
    participant RateLimiter
    participant Auth
    participant Cache
    participant Controller

    Client->>Sanitizer: POST /api/auth/register (JSON Body)
    Sanitizer->>Sanitizer: Strip Mongo Operators ($)
    Sanitizer->>RateLimiter: Check IP Limit Threshold
    RateLimiter->>Auth: Validate JWT / Password
    Auth->>Cache: Check Cached Response
    Cache->>Controller: Route Match & DB Write
    Controller-->>Client: 200 OK / Success
```

## Component Overview
- **Client**: Build on React SPA with Vite, styled using Tailwind CSS.
- **Server**: Express.js REST APIs with robust middleware.
