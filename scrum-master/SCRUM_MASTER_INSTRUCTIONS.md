I have added a `scrum-master/` folder to the root of this existing application.

Integrate Scrum Master into this application using the files and instructions inside:

`scrum-master/`

IMPORTANT RULES:

1. First inspect the existing application structure.
2. Read:
   - `scrum-master/SCRUM_MASTER_INSTRUCTIONS.md`
   - `scrum-master/README.md`
   - `scrum-master/scrum-master.config.example`
3. Identify the application's:
   - name
   - framework
   - language
   - backend
   - package manager
   - development/start commands
   - appropriate integration/startup point
4. Do NOT replace, rewrite, or restructure the existing application.
5. Do NOT remove existing dependencies or functionality.
6. Do NOT change existing authentication, routing, database logic, APIs, or business logic unless required specifically for Scrum Master integration.
7. Keep Scrum Master isolated as a lightweight observability integration.
8. Use `scrum-master/scrum-master-agent.js` as the core Scrum Master agent.
9. Configure the agent using environment variables rather than hardcoding credentials.
10. Never hardcode MongoDB credentials, JWT secrets, API keys, passwords, or other sensitive values.
11. Preserve the existing application startup and development workflow.
12. If the application uses Node.js, integrate the agent using the least invasive appropriate startup mechanism.
13. If the application has a separate backend, prefer running the Scrum Master agent alongside the backend rather than modifying frontend business logic.
14. If the application uses another language/framework, keep the Scrum Master agent as an independent Node.js process when possible instead of forcing framework-specific changes.
15. Do not expose the Scrum Master enrollment token to the frontend/browser unnecessarily.
16. Do not create fake telemetry, fake heartbeat events, or fake project data.
17. Start the Scrum Master agent using the actual application's environment/configuration.
18. Verify that the agent successfully enrolls with Scrum Master.
19. Verify that the agent sends a real heartbeat.
20. If an integration decision is ambiguous, inspect the existing project and choose the least invasive solution rather than asking me to rewrite the application.

After integration:

- explain what files were changed
- explain how the Scrum Master agent is started
- verify the application still starts normally
- verify the Scrum Master agent is running
- verify enrollment succeeded
- verify a heartbeat was received
- do not claim success unless these checks actually pass

The application's existing behavior must remain unchanged.
