# Security Policy

## Supported Versions

Currently, only the `main` branch (v1.x) is actively supported with security updates.

## Reporting a Vulnerability

Please do not publicly report security vulnerabilities in GitHub issues.

If you discover a security vulnerability, please send an email to the repository maintainers or use the GitHub Security Advisory private reporting feature if enabled on the repository.

We will acknowledge receipt of your vulnerability report and strive to send you regular updates about our progress.

## Security Practices

PolyTalk AI implements several security mechanisms by default:

- **Input Validation**: All incoming requests to the `/chat` API are sanitized to remove malformed payloads.
- **Output Escaping**: User-generated content is escaped during Markdown parsing to prevent XSS (Cross-Site Scripting).
- **Environment Variable Protection**: API keys (such as `GROQ_API_KEY`) are managed entirely via `.env` files and are never exposed to the client.
- **Rate Limiting**: Sliding window rate-limiting is implemented on the Express server to prevent abuse and API exhaustion.
- **Error Handling**: Global exception handlers suppress internal stack traces from leaking to the frontend.
