# Menazeah (מנצח) - The AI Conductor

Menazeah (Hebrew for Conductor) is a real-time collaborative AI-powered development environment. It enables humans and Gemini AI agents to work together seamlessly on the same codebase, synchronized across multiple machines.

## Key Features

- **Dual GPU-Powered Terminals:**
    - **Left Terminal (IRC/Orchestration):** A project-wide summary of all user sessions, AI responses, and collaborative chat.
    - **Right Terminal (Local Session):** Your personal Gemini CLI session for direct interaction and coding.
- **Continuous Git Orchestration:**
    - Real-time synchronization of project forks via Firebase Realtime Database.
    - Automated continuous merging managed by a single Conductor Super Agent (the project owner).
    - Intelligent merge error handling with manual intervention options.
- **Real-Time Synchronization:**
    - Filesystem synchronization using `rsync` with NAT hole punching support.
    - Ensures all teammates have the latest merged codebase locally.
- **Deep Integrations:**
    - **GitHub:** Direct linking of local folders to GitHub repositories.
    - **Google Meet:** Automatically generated meeting rooms for each project.
    - **Google Cloud:** Integrated for GPU-powered terminal sessions.
- **Multi-User Collaboration:**
    - User discovery via name or email search.
    - Visual distinction between "Intelligence Couples" (Human + Gemini) via synchronized app and terminal themes.
    - RTL (Right-to-Left) language support for global accessibility.

## Development Methodology: WTTITRTL

We strictly adhere to the **WTTITRTL** Kata:
1.  **W**rite tests
2.  **T**est (Verify failure)
3.  **I**mplement
4.  **T**est (Verify success)
5.  **R**efactor
6.  **T**est (Verify no regressions)
7.  **L**oop

## Tech Stack (Proposed)

- **Frontend/Desktop:** Electron or Tauri (for Linux/macOS/Windows support)
- **Terminal:** GPU-accelerated terminal emulator integration
- **Backend/State:** Firebase Realtime Database
- **Sync:** `rsync` with custom NAT hole punching logic
- **AI:** Gemini API via Gemini CLI

## Getting Started (Coming Soon)

1.  Login to Menazeah.
2.  Authenticate with GitHub.
3.  Create or link a project.
4.  Invite your teammates.
5.  Start CoCoding.

## License

Private / All Rights Reserved.
