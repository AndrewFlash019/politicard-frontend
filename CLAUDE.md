# CLAUDE.md

## Security Rules
- NEVER print, cat, echo, or display the contents of .env files or any file containing secrets
- NEVER output secret values, API keys, passwords, or tokens to the terminal or conversation
- When you need a value from .env, read it internally and use it silently - never print it
- If asked to verify a secret exists, confirm it exists (yes/no) without showing the value
- Never include secret values in commit messages, comments, or any output
