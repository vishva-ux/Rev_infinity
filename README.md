# REV∞ — Autonomous Revenue Intelligence

> **Razorpay Buildathon 2026 · Track 03: AI Revenue Recovery**
>
> REV∞ is an autonomous revenue recovery and financial intelligence platform for merchants. It detects revenue at risk, diagnoses root causes, predicts recovery probability, simulates counterfactual future scenarios across 7 recovery strategies, checks strict merchant financial policies, executes permitted actions through Razorpay TEST MODE, observes real-time webhooks, measures actual money recovered, and learns from outcomes.

---

## 🌟 Core Innovation: Revenue Digital Twin + Counterfactual Future Simulator

Instead of simple static payment retries ("Payment failed, retry it"), REV∞ reconstructs a merchant **Revenue Digital Twin** and evaluates branching financial futures:

```
"₹14,999 is at high risk of being lost.
The probable cause is payment-method degradation (Bank XYZ UPI API latency > 4200ms).
I simulated multiple interventions:
- Retry: Expected recovery ₹2,810 (35% confidence)
- Payment Link: Expected recovery ₹4,210 (72% confidence)
- Smart Recovery: Expected recovery ₹5,020 (85% confidence, risk-adjusted optimal)
Policy Guardian: APPROVED (under ₹10,000 autonomous cap, retry count 1/2).
Executed via Razorpay TEST MODE API.
₹9,999 recovered."
```

---

## 🛠️ Track 03 Core Workflow (The 11-Stage Pipeline)

```
[ DETECT ] -> [ DIAGNOSE ] -> [ PREDICT ] -> [ SIMULATE ] -> [ DECIDE ]
    |
    v
[ POLICY CHECK ] -> [ EXECUTE ] -> [ OBSERVE ] -> [ RECOVER ] -> [ MEASURE ] -> [ LEARN ]
```

1. **DETECT**: Ingests transaction failures, abandoned checkouts, and recurring mandate drops; calculates numerical Risk Score (0–100) and Revenue-at-Risk amount.
2. **DIAGNOSE**: Evaluates failure signals (Bank Decline, Timeout, Payment Degradation, Checkout Abandonment) to categorize root cause.
3. **PREDICT**: Runs deterministic statistical models (Logistic Regression / Decision Trees) to project recovery probability and cost.
4. **SIMULATE**: Runs Monte Carlo-style scenario generator across 7 strategies (*Do Nothing, Retry, Payment Link, Reminder, Alternate Payment, Smart Recovery, Aggressive Recovery*).
5. **DECIDE**: Strategy Judge computes Risk-Adjusted Net Value = $\text{Expected Recovery} - \text{Cost} - \text{Risk Penalty} - \text{Friction Penalty}$.
6. **POLICY CHECK**: Financial Guardian enforces merchant limits:
   - **Max Autonomous Amount**: $\le$ ₹10,000 (Higher amounts require human sign-off)
   - **Max Retries**: $\le 2$ attempts (Exceeding triggers policy block & manual escalation)
   - **Max Customer Contacts**: $\le 2$ contacts / 24h
   - **Idempotency Guard**: Prevents duplicate recovery execution on already recovered payments
7. **EXECUTE**: Autonomous Execution Engine calls Razorpay TEST MODE APIs (`POST /v1/payment_links`) with fallback sandbox driver.
8. **OBSERVE**: Listens to Razorpay webhooks (`payment_link.paid`, `payment.captured`) with signature verification.
9. **RECOVER**: Confirms actual money captured into merchant account.
10. **MEASURE**: Computes prediction variance ($\text{Actual} - \text{Predicted}$) and strategy efficiency.
11. **LEARN**: Updates customer Revenue DNA profiles and strategy conversion weights.

---

## 🏗️ System Architecture & Infrastructure

```
                         REV∞ Architecture
                         
                  +-------------------------------+
                  |  Next.js 14 Web Application   |
                  |  (TypeScript / Tailwind CSS)  |
                  +---------------+---------------+
                                  |
                           REST / WebSockets
                                  |
                  +---------------v---------------+
                  |   REV∞ Core Engine & APIs     |
                  |   (Node.js / Express Architecture)|
                  +---+-----------+-----------+---+
                      |           |           |
         +------------+           |           +------------+
         v                        v                        v
+------------------+    +------------------+    +------------------+
| Risk & Predictive|    | Financial Policy |    | Razorpay TEST    |
| ML Engine        |    | Guardian Engine  |    | Mode Executor    |
+------------------+    +------------------+    +------------------+
         |                        |                        |
         +----------------+-------+-------+----------------+
                          |               |
                          v               v
                 +-----------------+ +---------------+
                 | PostgreSQL DB   | | Seed & Demo   |
                 | (Relational/Drizzle)| Dataset     |
                 +-----------------+ +---------------+
```

### Infrastructure Stack:
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, Framer Motion, 3D WebGL Three.js
- **Backend & APIs**: Next.js Server Actions & API Handlers (REST & Webhooks)
- **AI & Simulation Engine**: Deterministic statistical prediction & Monte Carlo counterfactual simulator
- **Database**: Relational PostgreSQL schema (with embedded seeding engine generating 10,000+ realistic synthetic transactions and 1,000+ customer profiles)
- **Razorpay Integration**: Official Razorpay TEST MODE API client & webhook signature verifier + fallback sandbox driver

---

## 🌐 3D WebGL Revenue Universe Globe

The Command Center features a custom 3D WebGL WebGL Revenue Universe visualization built with **Three.js**:
- **6,000 Particle Surface**: Surface point grid generated via spherical coordinate math $(r, \phi, \theta)$.
- **Atmospheric Outer Glow**: Additive blended ambient atmosphere.
- **20+ Glowing Revenue Event Nodes**: Color-coded by event state (🔴 Risk, 🟣 Recovery, 🟢 Success, 🔵 Normal).
- **Elevated 3D Arcs & Traveling Pulses**: `CatmullRomCurve3` connection curves with animated data pulse particles.
- **Vertical Activity Bars**: Equalizer-style activity bars around lower globe coordinates.
- **Interactive Raycast Tooltips**: Hover over any node to view cluster volume, amount, and risk classification.

---

## 📊 10-Page Enterprise Fintech Console

1. **Command Center**: Executive overview, KPIs (₹10.24L Risk, ₹6.42L Recoverable, ₹4.87L Recovered, 75.8% Recovery Rate), 3D Globe, Live Feed, At-Risk Pipeline Table.
2. **Revenue Universe**: Full-screen interactive graph showing Customer $\rightarrow$ Transaction $\rightarrow$ Failure $\rightarrow$ Action $\rightarrow$ Outcome relations.
3. **Risk Radar**: Live risk cluster monitoring with filterable risk score heatmaps.
4. **Future Simulator**: ⭐ Hero Feature — Compare 7 counterfactual strategies with risk-adjusted net value scoring & instant execution.
5. **Recovery Engine**: Interactive 11-stage pipeline timeline viewer with built-in scenario triggers.
6. **Interventions**: Audit table of all executed recovery actions with policy statuses.
7. **Customer DNA**: Behavioral profiles, LTV, preferred payment methods, best contact windows, recovery response rates.
8. **Analytics**: Revenue saved trends, prediction accuracy line charts, strategy success rate bars.
9. **Audit Ledger**: Immutable decision log recording decision IDs, policy rationale, and Razorpay response payloads.
10. **Settings**: Configurable Financial Guardian policy rules (autonomous caps, retry limits, contact caps).

---

## 🎮 Built-in Demonstration Scenarios

### Demo Scenario 1: Payment Degradation Event (Success Flow)
1. Bank XYZ UPI degradation occurs (413 transactions affected, ₹10.24L exposure).
2. AI diagnoses failure and simulates 7 scenarios.
3. **Smart Recovery** is selected (Expected recovery ₹9,999 at 85% confidence).
4. Policy Guardian approves (`MERCHANT_POLICY_PASSED`).
5. Razorpay TEST MODE payment link is generated and webhook `payment_link.paid` is received.
6. Dashboard updates ₹9,999 recovered revenue and audit log `REC_10482` is recorded.

### Demo Scenario 2: Policy Block Failure Demo
1. Transaction `TXN_92814` (₹2,199) has reached 2/2 retries.
2. AI proposes `RETRY` action.
3. Policy Guardian evaluates rule `MAX_RETRIES_EXCEEDED` and returns **`BLOCKED`**.
4. Transaction is escalated to manual review with zero duplicate execution.

---

## 💻 Local Setup & Development

```bash
# 1. Clone repository
git clone https://github.com/vishva-ux/Rev_infinity.git
cd Rev_infinity

# 2. Install dependencies
npm install

# 3. Environment configuration (Optional - fallback sandbox active out-of-the-box)
cp .env.example .env

# 4. Start local development server
npm run dev

# Open http://localhost:3000 or http://localhost:3001 in your browser
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run unit & integration test suites
npm test

# Run TypeScript type safety checks
npx tsc --noEmit

# Run Linter
npm run lint
```

---

## 🔒 Security & Policy Compliance

- **No Secret Leakage**: All Razorpay keys kept strictly server-side in `.env`.
- **Test Mode Guard**: Production execution disabled; all financial actions operate in Razorpay TEST MODE.
- **Idempotency**: Webhooks and payment link creation use unique idempotency keys.
- **Audit Ledger**: Every autonomous proposal, policy check, and API response is logged immutably.
