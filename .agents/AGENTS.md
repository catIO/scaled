# Agent Guidelines for Scaled

Scaled is a music practice web application built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui.

# Workspace Rules

- **Git Commits**: Do not automatically commit changes. Let the user run git commands.
- **Code Style**: Prefer clean components and hooks.
- **Verification**: Do not open, drive, or manually verify behavior in a browser unless the user explicitly asks. Validate changes with the fastest reliable non-browser method available: tests, linting, type checks, static analysis, logs, and code inspection.
- **UI Design**: Do not use raw emojis (e.g. 🎯, 📅, 🎉) in UI text, labels, headings, or toasts. Use clean typography or standard SVG icons (e.g. lucide-react or react-icons).
- **Beans Usage**: Only create beans for significant features or non-trivial bugs. Skip creating beans for small quick fixes, single-line edits, or investigatory requests.

**IMPORTANT**: before you do anything else, run the `beans prime` command and heed its output.
