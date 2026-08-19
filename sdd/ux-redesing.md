# UX re design

## Project Name: Zolvent
Vision: Transitioning Zolvent from a reactive data-entry tool to a proactive Financial Agent.

The Problem: Traditional finance apps suffer from "Friction Fatigue" (manual entry is a chore) and "Data Blindness" (users see what they spent, but don't know what they can spend).

The Design Mission: Create a "Glass-Box" AI experience. The interface should feel like a conversation between the user’s bank account and their future goals. It must prioritize Ambient Intelligence—where the app anticipates bills, suggests categories via interactive "Chips," and provides a "Safe-to-Spend" oracle that accounts for upcoming obligations. The goal is a PWA that feels as fluid as a native agent, using high-density visual feedback to confirm AI-generated drafts.


This is the list of all the current features:

* Accounts
* Recurring transactions
* Pending transactions (confirm and delete)
* Transactions CRUD, it supports natural language with manual date/time selection.
* Transaction type can be income, expense or transfer (among my accounts)
* Dashboard or Summary

---

This **Product Requirements Document (PRD)** is designed to bridge your current features with the "AI-Agent" vision we discussed. It focuses on the **Hybrid UI/AI** patterns and is structured to be "digested" easily by design tools like Google Stitch or for generating a **System Software Design (SSD)**.

---

# PRD: Personal Finance AI-Agent Redesign

## 1. Executive Summary

**Objective:** Evolve a traditional PWA finance tracker into a proactive "Financial Co-Pilot."
**Target User:** Individuals (like Carlos) balancing personal budgeting, long-term investments, and micro-entrepreneurship (e.g., *Listo Riko*).
**Core Philosophy:** **Zero-Friction Entry + Proactive Coaching.**

---

## 2. Feature Evolution & New Requirements

### A. The "Ghost" Transaction & Preview Card (Enhancement)

* **Current:** Manual CRUD / Basic Natural Language.
* **New:** **Draft-State Pipeline.**
* **Functional Req:** When a transaction is parsed via NL, it must enter a `status: "draft"` state.
* **UI Req:** A "Preview Card" with **Interactive Chips** for: `[Amount]`, `[Category]`, `[Account]`, and `[Date]`.
* **UX Req:** High-confidence matches (e.g., recurring rent) auto-confirm after 5 seconds unless "Undo" is tapped.



### B. Proactive "Safe-to-Spend" Oracle (New)

* **Functional Req:** A logic engine that subtracts `Pending Transactions` and `Expected Recurring Expenses` from current `Account Balances`.
* **UI Req:** A primary "Hero" metric on the Dashboard replacing the raw total balance.
* **Logic:** $SafeToSpend = CurrentBalance - (Sum of Bills due in < 7 days) - (Minimum Savings Goal)$.

### C. The "Impact" Timeline (Enhancement)

* **Current:** Simple list of Pending/Recurring.
* **New:** **Predictive Horizontal Timeline.**
* **Visuals:** A scrollable track where "Today" is the center.
* **Left (Past):** Desaturated icons of actual spend.
* **Right (Future):** Vibrant, outlined icons of `Pending` and `Recurring` payments.
* **UX:** Tapping a future icon allows the user to "Mark as Paid Early" or "Skip this Month."

#### Mobile support
Since a horizontal scroll can be clunky on small screens or interfere with "swipe-to-back" gestures, we’ll pivot to a Vertical Stacked Forecast.
* **The UI**: A "Today" marker acts as a sticky divider.
* **Above (Future)**: A condensed, vertical list of upcoming cards (Recurring/Pending).
* **Below (Past)**: The traditional transaction feed.
* **Interaction**: Tapping a "Future" card expands it into the Preview Card for quick confirmation or editing.


---

## 3. UI/UX Design Specifications (For Google Stitch)

### Dashboard Layout (The "Agent" View)

1. **Header:** Dynamic greeting with the "Safe-to-Spend" oracle.
2. **The "Command Bar":** A sticky footer or prominent floating action button (FAB) that opens the NL/Voice input.
3. **Contextual Widgets:** * **Subscription Audit:** "You haven't used Spotify this month. Cancel?"
* **Goal Progress:** "Your Medellín trip is 60% funded."


4. **The Timeline:** The horizontal "Forecast" scroll.

---

## 4. System Design Guidelines (For SSD)

### Architecture Requirements:

* **State Machine:** Implement a state machine for transactions (`Draft` -> `Pending` -> `Cleared`).
* **Local AI (Privacy First):** Utilize **Chrome Built-in AI APIs** (like the Prompt API) to categorize text locally before hitting a DB.
* **Schema Update:** Add `confidence_score` (float) and `metadata` (JSON) to the Transaction schema to store AI reasoning.

### Data Flow for NL Input:

1. **User Input** (Voice/Text) → **Local LLM** (Entity Extraction).
2. **Entity Match** → Check `Recurring Transactions` & `Alias` table.
3. **UI Render** → Generate `Preview Card` with extracted chips.
4. **User Confirmation** → Patch `Draft` to `Final` in DB.

---

## 5. Success Metrics

* **Friction Reduction:** Average time to log a transaction should be $< 3$ seconds.
* **Accuracy:** AI correctly categorizes $90\%$ of transactions after a 14-day learning period.
* **Engagement:** Users check the "Safe-to-Spend" metric daily vs. checking the "History" weekly.
