# Scrum Master Integration Layer

This package connects your existing application to the Scrum Master centralized observability dashboard.

## Overview
The Scrum Master Integration Agent provides a lightweight, secure heartbeat and status reporting mechanism. It allows your application to register as "connected" without sending sensitive business data, source code, or exposing database credentials.

## Setup Instructions

1. Move the `scrum-master/` folder into the root of your existing application repository.
2. Configure the environment variables shown in `scrum-master.config.example` (or add them to your application `.env`).
3. Provide the prompt in `SCRUM_MASTER_INSTRUCTIONS.md` to your AI coding agent (like Antigravity) to help you seamlessly integrate it without breaking your existing setup.
