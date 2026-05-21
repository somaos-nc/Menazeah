# Menazeah Project Mandates

In Menazeah we strictly adhere to the WTTITRTL Kata: (pron. Wetitrital)
1. Write tests
2. Test
3. Implement
4. Test
5. Refactor
6. Test
7. Loop

## Core Architectural Rules
- **Continuous Merge via Firebase Cloud Functions:** The "Conductor SuperAgent" is implemented as a set of serverless functions to enable headless orchestration.
- **Web-Native P2P:** Use WebRTC Data Channels for real-time filesystem synchronization (Web-rsync).
- **Virtual Filesystem:** All project code is stored in `lightning-fs` (IndexedDB) within the browser.
- **Git Operations:** Use `isomorphic-git` for all version control tasks in the client.
- **RTL Support:** Mandatory for all UI components and terminal displays.
