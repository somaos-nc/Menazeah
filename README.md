# Menazeah (מנצח) - Conductor

Menazeah (Hebrew for "Conductor") is a real-time, GPU AI-powered collaborative development environment. It enables "intelligence couples" (Human + Gemini) to work together seamlessly on the same codebase, synchronized across multiple machines through a continuous git merge orchestration.

## Core Vision

Menazeah acts as a Conductor SuperAgent that orchestrates the collaboration of multiple developers and their respective AI assistants. It ensures that every participant's contributions are merged continuously into a central repository, maintaining a "live" manifest of the project's state.

## Key Features

- **Dual GPU-Powered Terminals:**
    - **Left Terminal (The Conductor):** A project-wide summary of all user sessions, AI responses, and an IRC-like chat for real-time communication.
    - **Right Terminal (The Gemini CLI):** The active workspace where each user interacts with their personal Gemini CLI agent.
- **Continuous Git Orchestration:**
    - Real-time synchronization of project forks via Firebase Realtime Database (RTDB).
    - Automated continuous merging managed by the Conductor SuperAgent (on the project owner's computer).
    - Intelligent merge error handling with manual intervention options.
- **Real-Time Synchronization:**
    - Filesystem synchronization using `rsync` with NAT hole punching support.
    - Only the continuously merged repo is synced across all user file systems.
- **Deep Integrations:**
    - **GitHub:** Direct linking of local folders to GitHub repositories.
    - **Google Meet:** Automatically generated meeting rooms for each project.
    - **Google Cloud:** Integrated for GPU-powered terminal sessions.
- **Multi-User Collaboration:**
    - User discovery via name or email search.
    - Visual distinction between users via synchronized app and terminal themes.
    - Full RTL (Right-to-Left) language support for global accessibility.

## Development Methodology: WTTITRTL

We strictly adhere to the **WTTITRTL** Kata:
1. **W**rite tests
2. **T**est
3. **I**mplement
4. **T**est
5. **R**efactor
6. **T**est
7. **L**oop

## Tech Stack (Proposed)

- **Frontend/Desktop:** Electron or Tauri (for Linux/macOS/Windows support)
- **Terminal:** GPU-accelerated terminal emulator integration
- **Backend/State:** Firebase Realtime Database
- **Sync:** `rsync` with custom NAT hole punching logic
- **AI:** Gemini API via Gemini CLI

## Getting Started

### Prerequisites

- Gemini CLI
- GitHub CLI (`gh`)
- Google Cloud SDK (`gcloud`)
- Firebase Account (for RTDB)

### Usage Case

1. **Login:** Log into Menazeah and GitHub.
2. **Project Creation:** Create a local folder and link it to a new GitHub repo.
3. **Team Selection:** Select teammates to invite to the project.
4. **CoCode:** Start collaborative coding with AI orchestration.
5. **Loop:** Iterate and build together.

## Documentation

- [TUTORIAL.md](TUTORIAL.md) - In-app tutorial for getting started.
- [GEMINI.md](GEMINI.md) - Project-specific instructions for Gemini agents.

---
*Created by the Conductor SuperAgent.*
