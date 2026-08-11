# Contributing to PolyTalk AI

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Getting Started

1. Clone the repository: `git clone https://github.com/your-username/polytalk-ai.git`
2. Navigate to the project directory: `cd polytalk-ai`

## Development Setup

You can run PolyTalk AI using either Node.js or Python.

### Node.js (Express/Production Backend)
1. Install dependencies: `npm install`
2. Start the server: `npm run dev`

### Python (Flask/Development Backend)
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Start the server: `python app.py`

## Branch Naming

Please name your branches using the following format:
- `feature/description-of-feature`
- `fix/description-of-fix`
- `docs/description-of-documentation`
- `refactor/description-of-refactor`

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`npm test` or `pytest`).
4. Ensure your code lints.
5. Issue that pull request!

## Commit Guidelines

We use conventional commits:
- `feat:` (new feature for the user, not a new feature for build script)
- `fix:` (bug fix for the user, not a fix to a build script)
- `docs:` (changes to the documentation)
- `refactor:` (refactoring production code, eg. renaming a variable)
- `test:` (adding missing tests, refactoring tests; no production code change)
- `chore:` (updating grunt tasks etc; no production code change)
