# SE Trading — Mobile-First PWA Expense & Project Tracker

A Progressive Web App (PWA) built specifically for **SE Trading** to manage subcontracting electrical, solar installation, wiring, and other establishment projects. It replaces Excel tracking sheets with instant mobile receipt logging, project financial summaries, profitability tracking, and clean Excel reporting.

---

## Features

- **Google Authentication Only**: Secure 1-tap sign-in with complete per-user Firestore isolation.
- **Projects Management**:
  - Project name, client/customer, contract amount (₱ PHP), start & end dates, project status (active, completed, on-hold).
  - Live calculation of: Contract Amount, Total Project Expenses, Remaining Balance, and Percentage Utilized with visual progress indicators.
- **Fast Mobile Receipt / Expense Logging**:
  - Date (defaults to today)
  - Store Name & Address
  - TIN #
  - Amount in Philippine Peso (₱)
  - Expense Types: **Project Expense** (mandatory project link), **Operation Expense**, **Office Expense**
  - Optional Notes
  - **"Save & Add Another"** quick-batch entry flow for receipts.
- **Expenses Directory**:
  - Comprehensive listing with search (store name, notes, address).
  - Quick filter chips by Expense Type (`Project`, `Operation`, `Office`).
  - Dropdown filter by Project.
  - Date range filters (`From` / `To`).
  - Edit and delete actions with confirmation dialogs.
- **Interactive Dashboard**:
  - Real-time financial summary: Project Income, Total Expenses, Project Expenses, Operation Expenses, Office Expenses, and Net Result.
  - Active projects cards with financial health progress bars.
  - Recent receipts feed with quick links.
- **Reports & Excel Export**:
  - Period filters: *This Month*, *Last Month*, *This Year*, or *Custom Date Range*.
  - Financial summary table + project breakdown.
  - Multi-sheet **Excel (.xlsx) export** containing detailed expense entries and project financial health summaries.
- **PWA & Offline Readiness**:
  - Installable to iOS / Android home screen with custom SE Trading app icon.
  - IndexedDB offline persistence via Firestore SDK.
  - Works seamlessly under the Firebase Free / Spark tier.

---

## Setup & Firebase Deployment Instructions

### 1. Enable Google Sign-In in Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select the project: **`setradingapp`**.
3. Navigate to **Authentication** > **Sign-in method**.
4. Click **Add new provider** > Select **Google**.
5. Enable Google Sign-in, enter your project support email, and click **Save**.
6. Under **Authorized domains** (in Authentication > Settings > Authorized domains), ensure `localhost` and `setradingapp.web.app` / `setradingapp.firebaseapp.com` are present.

### 2. Create Firestore Database
1. In Firebase Console, click **Firestore Database** > **Create database**.
2. Select **Production mode** and choose a multi-region or closest region (e.g. `asia-southeast1` or `asia-east1`).
3. Click **Enable**.

### 3. Deploy Firestore Security Rules & Hosting

Make sure you have Firebase CLI installed:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Build the PWA for production:
```bash
npm run build
```

Deploy both the Firestore rules and the web application:
```bash
firebase deploy
```

If you only want to deploy hosting:
```bash
firebase deploy --only hosting
```

If you only want to deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

---

## Local Development

To run the development server locally:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (or use device emulation / open on your phone via local Wi-Fi).
