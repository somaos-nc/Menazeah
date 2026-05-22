# Menazeah (מנצח) 🚀

An open-source, web-native, AI-powered collaborative development environment (IDE) built for real-time peer-to-peer collaboration and headless agentic orchestration.

🔗 **Live Web UI:** [https://menazeah-conductor.web.app/](https://menazeah-conductor.web.app/)

---

## 🌟 Key Features

- **Continuous Merge via Firebase Cloud Functions:** Powered by the "Conductor SuperAgent" serverless orchestrator.
- **Web-Native P2P:** Utilizes WebRTC Data Channels for real-time filesystem synchronization (Web-rsync).
- **Virtual Filesystem:** All project code is stored securely inside the browser via `lightning-fs` (IndexedDB).
- **In-Browser Git Operations:** Full version control directly in the client using `isomorphic-git`.
- **Dual Terminal Layout:**
  - **Left Terminal:** Conductor Orchestration (agent activity, merges, action summaries).
  - **Right Terminal:** Gemini CLI Workspace (interactive terminal shell).
- **RTL Support:** Built-in Right-to-Left language and display support for UI components and terminals.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Storage:** Dexie (IndexedDB), `@isomorphic-git/lightning-fs`
- **P2P Sync:** WebRTC (`simple-peer`, `socket.io-client` for signaling)
- **Git:** `isomorphic-git`
- **Terminal UI:** `xterm.js`
- **Backend Orchestration:** Firebase Cloud Functions & Cloud Hosting

---

## 🧑‍💻 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/somaos-nc/Menazeah.git
   cd Menazeah
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server locally:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the application in your browser.

---

## 🧪 Testing

We adhere strictly to the **WTTITRTL** (Write Tests, Test, Implement, Test, Refactor, Test, Loop) development lifecycle.

To run the automated test suite:
```bash
npm run test
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
