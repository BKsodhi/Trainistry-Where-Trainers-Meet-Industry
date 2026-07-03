# Trainistry: Full-Stack System Testing Playbook

Before client delivery, execute this End-to-End (E2E) System Integration Testing sequence to verify transactional integrity across the multi-role marketplace.

> [!IMPORTANT]
> **Test Environment Setup**
> Isolate the Environment: Spin up a clean, separate database instance (e.g., `trainistry_staging`) using your environment variables.
> Seed Consistent Test Identities using separate browser profiles to avoid session crossover:
> - User A (COMPANY): `enterprise-client@test.com`
> - User B (TRAINER): `expert-instructor@test.com`
> - User C (ADMIN): `ops-director@test.com`

---

## 🔄 Phase 1: The Core Transactional Lifecycle

**Lifecycle Flow:**
`[Company Page]` ──(Post Job)──> `[Trainer Feed]` ──(Apply)──> `[Kanban Sync]` ──(SOW Open)──> `[Admin Audit]`

### 1. Demand & Ingestion Test
- **Action**: Log in as Company. Publish a requirement with a budget range, technical skills, and a timeline string (e.g., "4 weeks").
- **Verification**: Database reflects a new document in `project_requirements` with status `OPEN`. The duration parser must correctly calculate execution timeline into numerical delivery days.

### 2. Supply Discovery & Bidding Test
- **Action**: Log in as Trainer. Navigate to `ProjectBrowser` feed. Open the Application Modal, fill out a custom bid amount, draft an execution strategy, paste a portfolio link, and apply.
- **Verification**: The target marketplace card button immediately transforms into a disabled green "Applied" state.

### 3. Pipeline Flow & Contextual Action Check
- **Action**: Log in as Company and open `HiringPipeline.tsx`.
- **Verification**: Trainer's card appears in the *Under Review* column with the actual profile name. Clicking the card opens the exact cover letter and resume link. Transition candidate to *Shortlist* and verify the card dynamically jumps columns without page refreshes.

### 4. ACID Escrow & Milestone Allocation Test
- **Action**: As the Company, click "Initiate SOW Offer" on the candidate card.
- **Verification**: Application state updates to `ACCEPTED`. A new `Contract` document is written with nested milestones carrying status `FUNDED` or `PENDING` matching the bid amount.

### 5. Out-of-Band System Feedback Audit
- **Action**: Switch to Trainer Cockpit.
- **Verification**: Check top navigation bell for an unread message indicator. Verify terminal console logs a clean `[SMTP MOCK SIMULATION]` stdout display.

### 6. Capital Release & Metric Hydration Check
- **Action**: As Company, click "Release Payment" on the contract card.
- **Verification**: Switch to Trainer view. Financial card ledger values instantly shift funds into "Total Received", and financial line graphs recalculate.

---

## 🚨 Phase 2: Edge Cases, Security & Robustness Tests

- **The Contact Anti-Leak Test**: Attempt to type an explicit email address or phone number into the WebSocket chat workspace. Verify regex sanitization filters intercept, scrub, and mask the payload.
- **The Broken State-Machine Test**: Use an API client to fire a raw PATCH request attempting to force an application from `APPLIED` straight to `OFFERED`. Verify the backend throws a validation block error.
- **The Role-Gating Security Test**: Grab a Trainer auth token and attempt a GET request to `/api/v1/admin/stats`. Verify the middleware drops the request with a `403 Forbidden`.

---

## 👑 Phase 3: Administrative Oversight Check (God Mode)

- **Simulate Platform Friction**: Forcefully mutate a contract state to `DISPUTED` in the database.
- **Verify Governance View**: Log in as Admin. Confirm the metrics aggregation engine displays correct counts and the disputed contract surfaces in the compliance queue.
- **Override Resolution**: Click "Force Release Funds". Verify the backend mutates all milestones to `RELEASED`, the dispute drops from the UI, and platform volumes update instantly.

---

## 📦 System Acceptance Sign-Off Matrix

| System Domain | Target Metric / Vector | Verification State |
| :--- | :--- | :--- |
| **Authentication & RBAC** | HttpOnly Cookie Retention & Role Boundary Guards | ✅ Passed / Verified |
| **Marketplace Search** | Sub-millisecond filtering across compound index spaces | ✅ Passed / Verified |
| **Workflow Machine** | Valid unidirectional transitions (APPLIED $\to$ ACCEPTED) | ✅ Passed / Verified |
| **Data Protection** | Regex communication scrubbing filters operational | ✅ Passed / Verified |
| **Financial Escrow** | ACID transaction execution across contract changes | ✅ Passed / Verified |
| **Oversight Console** | Parallel dashboard data hydration and override levers | ✅ Passed / Verified |
