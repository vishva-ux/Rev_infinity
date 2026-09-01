# REV∞ — Autonomous Revenue Intelligence
## System Architecture & Technical Specification

### 1. Overview & Core Mission
REV∞ is an enterprise autonomous revenue intelligence and recovery engine built for Razorpay Track 03 (AI REVENUE RECOVERY). It proactively detects at-risk transactions, diagnoses payment failure root causes, predicts recovery probability, simulates counterfactual future scenarios, validates actions against strict financial policies, executes interventions via Razorpay TEST MODE APIs, observes webhooks, and updates statistical learning models.

---

### 2. Track 03 Core Workflow (The 11-Stage Pipeline)
```
[ DETECT ] -> [ DIAGNOSE ] -> [ PREDICT ] -> [ SIMULATE ] -> [ DECIDE ]
    |
    v
[ POLICY CHECK ] -> [ EXECUTE ] -> [ OBSERVE ] -> [ RECOVER ] -> [ MEASURE ] -> [ LEARN ]
```

1. **DETECT**: Ingests payment failures, abandoned checkouts, and recurring billing drops; calculates numerical Risk Score (0-100) and Revenue-at-Risk amount.
2. **DIAGNOSE**: Evaluates failure signals (bank decline, timeout, payment method degradation, customer history) to categorize root cause.
3. **PREDICT**: Runs deterministic statistical models (Logistic/Gradient-boosted decision trees) to estimate recovery probability, expected friction, and recovery value.
4. **SIMULATE**: Runs Monte Carlo / scenario counterfactual models across 6 intervention strategies:
   - *Do Nothing*
   - *Retry*
   - *Payment Link*
   - *Reminder*
   - *Alternate Payment Method*
   - *Smart Recovery*
5. **DECIDE**: Strategy Judge computes Risk-Adjusted Net Value = $\text{Expected Recovery} - \text{Intervention Cost} - \text{Risk Penalty} - \text{Friction Penalty}$.
6. **POLICY CHECK**: Financial Guardian validates policy constraints (Max Autonomous Amount ₹10,000, Max Retries = 2, Max Customer Contacts = 2, Duplicate Check). Returns `APPROVED`, `BLOCKED`, or `REQUIRES_HUMAN_APPROVAL`.
7. **EXECUTE**: Autonomous Execution Engine interacts with Razorpay TEST MODE APIs (Payment Link creation, retry request) with idempotency tokens.
8. **OBSERVE**: Listens to Razorpay TEST MODE Webhooks (`payment.captured`, `payment.failed`, `payment_link.paid`) to confirm outcome.
9. **RECOVER**: Computes verified money recovered.
10. **MEASURE**: Calculates prediction variance ($\text{Actual} - \text{Predicted}$) and intervention efficiency.
11. **LEARN**: Updates customer Revenue DNA profiles and strategy conversion weights.

---

### 3. High-Level Modular Monorepo Architecture
```
                         REV∞ Architecture
                         
                     +-----------------------+
                     | Next.js 14 Frontend   |
                     | (Shadcn UI / Tailwind)|
                     +-----------+-----------+
                                 |
                          REST / WS API
                                 |
                     +-----------v-----------+
                     |  REV∞ Core Engine     |
                     |  (Node.js / Fastify)  |
                     +---+-------+-------+---+
                         |       |       |
            +------------+       |       +------------+
            v                    v                    v
  +------------------+  +------------------+  +------------------+
  | Predictive & Risk|  | Financial Policy |  | Razorpay TEST    |
  | Engine (Stat/ML) |  | Guardian Engine  |  | Mode Executor    |
  +------------------+  +------------------+  +------------------+
            |                    |                    |
            +------------+-------+-------+------------+
                         |               |
                         v               v
                +-----------------+ +---------------+
                | PostgreSQL DB   | | Seed & Demo   |
                | (Drizzle/Prisma)| | Dataset       |
                +-----------------+ +---------------+
```

---

### 4. Database Schema Overview
- `merchants`: Merchant details & settings
- `customers` & `customer_profiles`: Revenue DNA, payment method preferences, LTV, best contact window
- `transactions` & `payments`: Transaction history, amounts, status, failure reasons
- `risk_events`: Ingested failure events with computed risk score
- `simulation_runs` & `simulation_scenarios`: Stored multi-future simulation predictions
- `recovery_decisions`: Decisions made by Strategy Judge & Red Team Agent
- `policy_rules` & `policy_decisions`: Audit records for Policy Guardian approvals/blocks
- `recovery_attempts`: Executed actions (Razorpay link ID, retry status)
- `audit_logs`: Immutable audit ledger
- `webhook_events`: Idempotent webhook receipt log

---

### 5. Financial Policy Guardian Engine Rules
- **Rule 1: Autonomous Threshold**: Max amount for autonomous execution is ₹10,000. Higher amounts trigger `REQUIRES_HUMAN_APPROVAL`.
- **Rule 2: Retry Cap**: Maximum 2 automated retries per transaction. Exceeding triggers `BLOCKED`.
- **Rule 3: Contact Frequency Cap**: Max 2 recovery notifications per customer within 24 hours.
- **Rule 4: Double Recovery Guard**: If payment is already captured or link paid, return `BLOCKED`.

---

### 6. Razorpay TEST MODE Integration
- **Payment Link API**: Generates official Razorpay Test Mode Payment Links (`https://api.razorpay.com/v1/payment_links`).
- **Webhook Processing**: Validates `x-razorpay-signature` and updates transaction state from `payment_link.paid` or `payment.captured`.
- **Fallback Simulation**: If API credentials are not set, uses an authenticated test sandbox driver that simulates Razorpay HTTP responses identically.

---

### 7. UI/UX Design System Specification
- Dual-theme engine supporting instant switching between **Light Enterprise Theme** and **Sleek Futuristic Dark Theme**.
- **Light Theme**: Enterprise White (`#FFFFFF`), Crisp Slate (`#F8FAFC`), Slate Border (`#E2E8F0`), Razorpay Blue (`#0066FF`), Dark Text (`#0F172A`).
- **Dark Theme**: Deep Space (`#0B0F19`), Obsidian Cards (`#111827`), Subtle Border (`#1F2937`), Neon Violet Accent (`#8B5CF6`), Crisp Text (`#F9FAFB`).
- Theme Toggle control available in Topbar & Settings for instant runtime switching.
- High information density, clean typography, responsive layout, clear status pills, micro-animations for live pipeline activity.
