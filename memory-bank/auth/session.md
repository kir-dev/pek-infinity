---
purpose: "Explain session management and cookies"
triggers: ["debugging session", "security audit"]
keywords: ["auth", "session", "cookie", "jwt"]
importance: "medium"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Session Management

Sessions are stateless and secured via signed cookies.

## The Cookie
-   **Name**: `pek_session` (or similar).
-   **Content**: Signed JWT containing `userId`.
-   **Attributes**: `HttpOnly`, `Secure`, `SameSite=Lax`.

## Validation
On every request, the `authGuard` verifies the cookie signature. If valid, the `userId` is extracted and injected into the request context.

## Code Reference
-   *Implementation*: `full-stack/src/domains/auth/session.service.ts` (Pending implementation).
