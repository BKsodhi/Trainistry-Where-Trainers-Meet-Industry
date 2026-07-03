# Cloud IDE System Testing Playbook

Before production deployment or client delivery, execute this End-to-End (E2E) Integration Testing sequence to verify container provisioning speed, WebSocket sync states, and local terminal execution barriers.

> [!IMPORTANT]
> **Staging Testing Prerequisites**
> 
> **Environment Isolation:** Spin up a dedicated staging cluster matching production orchestration conditions (e.g., lightweight isolated compute nodes or dev-containers running inside micro-sandboxes).
> **Concurrency Mapping Setup:** Open two separate, independent client window contexts running under distinct network sessions to test real-time operational transformation metrics accurately.

---

## 🔄 Phase 1: The Core Workspace Lifecycle

**Lifecycle Flow:**
`[Dashboard Space]` ──(Provision Node)──> `[Monaco / Editor Grid]` ──(Write Code)──> `[LSP Intercept]` ──(Remote Shell)

### 1. Workspace Isolation & Ephemeral Compute Ingestion Test
- **Action:** Log into the Antigravity control console. Select a standard environment profile (e.g., Node.js / TypeScript v20 Stack) and hit **Spin Up Workspace**.
- **Verification:** Verify that the server maps clean container initialization records, provisions dedicated storage allocations, sets up network bridges, and loads the code editor grid within a strict target window (less than 5 seconds benchmark).

### 2. Multi-User Real-Time Operational Transformation (CRDT) Test
- **Action:** Open the workspace invitation link in User Session B. In User Session A, open a project tracking script (`index.ts`) and begin writing code simultaneously with User Session B on the exact same row indexes.
- **Verification:** Verify that cursors render distinct, role-colored tags across screens. The textual inputs must resolve instantly using Conflict-Free Replicated Data Types (CRDTs) without text shifts, letter drops, or cursor alignment breaks.

### 3. Language Server Protocol (LSP) Service Communication Check
- **Action:** Inside the open text tab, deliberately draft an incomplete interface or force a missing import declaration statement (e.g., type `const map: Map<string, number> = new Ma`). Wait for the IntelliSense trigger.
- **Verification:** Verify that the editor diagnostics panel highlights the exact token index boundary, displays the correct error diagnostic code tooltip inline, and suggests valid auto-completion choices through the LSP bridge.

### 4. Interactive Pseudo-Terminal (PTY) Shell Stream Test
- **Action:** Open the integrated terminal workspace panel at the bottom of the screen. Execute a heavy streaming shell diagnostic command loop (e.g., `npm install` or a continuous shell file logging script).
- **Verification:** Verify that raw text array packets stream efficiently over the WebSocket channel without terminal buffer truncation. Intercept keyboard commands instantly and confirm that process termination shortcuts (such as `Ctrl + C`) kill execution loops immediately inside the remote backend container workspace.

---

## 🚨 Phase 2: System Edge Cases & Security Robustness Tests

- **The Network Drop Disconnection Resilience Test:** Simulate a sudden internet drop by forcing the primary client window into an offline network profile for 30 seconds while typing characters. Reconnect the interface. Verify that the editor displays a clean reconnect synchronization overlay, avoids saving conflict fragments, and cleanly catches up to the database state without data loss.
- **The Remote Container Escape Sandbox Intercept Test:** Open the integrated terminal command panel and attempt to execute malicious breakout syntax loops designed to read host infrastructure variables (e.g., `cat /proc/1/cgroup` or running unverified mounting scripts). Verify that the system's runtime layer drops the execution, logs a container alert flag, and isolates the user session within its secure sandbox boundary.
- **The Concurrent Workspace Inode Exhaustion Test:** Create an automated loop script that generates 10,000 minimal system files sequentially inside the project browser tree. Verify that the file-watcher service throttles the indexing system efficiently, prevents browser thread locking, and handles file additions cleanly across the navigation pane.

---

## 📦 System Acceptance Sign-Off Matrix

| System Domain | Target Metric / Vector | Verification State |
| :--- | :--- | :--- |
| **Compute Orchestration** | Ephemeral node setup and workspace load speed | ⬜ Pending Audit |
| **CRDT Real-time Engine** | Delta state synchronization across independent sessions | ⬜ Pending Audit |
| **LSP Diagnostics** | Error checking and context actions via language servers | ⬜ Pending Audit |
| **PTY Terminal Bridge** | Bidirectional shell streaming and command intercepts | ⬜ Pending Audit |
| **Sandbox Security** | Complete network isolation and container security bounds | ⬜ Pending Audit |
