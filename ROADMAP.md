# Menazeah Development Roadmap

This roadmap outlines the path to transforming the Menazeah web application into a fully functional, AI-powered collaborative development environment. We strictly adhere to the **WTTITRTL** Kata for all development.

## Phase 1: Interactive Virtual Environment (Current Focus)
- [ ] **Command Parser (Right Terminal):**
    - Implement a shell-like parser for the "Gemini CLI Workspace".
    - Supported commands: `ls`, `cd`, `mkdir`, `touch`, `cat`, `rm`.
    - Integrated with `lightning-fs` (IndexedDB).
- [ ] **Git Integration (Client-Side):**
    - Wire up `isomorphic-git` to the terminal.
    - Commands: `git init`, `git status`, `git add`, `git commit`.
    - Persistence verification across browser refreshes.
- [ ] **Gemini API Bridge:**
    - Create a secure proxy or client-side handler for Gemini API calls.
    - Implement the `gemini` command to interact with the AI agent.

## Phase 2: Peer-to-Peer Synchronization (Web-rsync)
- [ ] **WebRTC Signaling:**
    - Use Firebase Firestore to exchange signals and establish P2P connections.
- [ ] **Differential Sync Protocol:**
    - Implement "Web-rsync": calculating file diffs between clients.
    - Real-time broadcasting of changes over WebRTC Data Channels.
- [ ] **Conflict Notification UI:**
    - Basic UI in the "Left Terminal" to show sync status between peers.

## Phase 3: The Cloud Conductor (Orchestration)
- [ ] **Headless Merge (Firebase Functions):**
    - Deploy Cloud Functions to handle the automated continuous git merge.
    - Trigger merges on repository updates.
- [ ] **Advanced Conflict Resolution:**
    - Interactive "Left Terminal" UI for resolving complex git merges that the Cloud Conductor cannot handle automatically.

## Phase 4: Collaboration & Experience
- [ ] **User Discovery:**
    - Team search panel (name/email) powered by Firebase Auth and Firestore.
- [ ] **Communication Window:**
    - Integrated WebRTC audio/video popups (The "Google Meet" experience).
- [ ] **RTL & Theming:**
    - Full Right-to-Left support for Hebrew/Arabic.
    - Synchronized app and terminal themes for "Intelligence Couples".

## Phase 5: Testing & Distribution
- [ ] **Multi-Session Testing:**
    - Logic to test simultaneous instances with different accounts.
- [ ] **Installer:**
    - Linux/Desktop wrapper (Electron/Tauri) for a native-like experience.
- [ ] **Tutorial:**
    - Interactive in-app onboarding based on `TUTORIAL.md`.

---
*Created by the Conductor SuperAgent.*
