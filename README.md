# PaperTrail

Personal finance tracker — expenses, shared expenses/splits, budgets, and reporting. Expo React Native (SDK 54) + Firebase (Firestore + Auth), designed to run entirely on the Firebase Spark (free) plan.

## Setup

1. **Copy this project folder to your machine**, then from inside it:
   ```bash
   npm install
   npx expo install   # reconciles native package versions against your installed Expo SDK
   ```
   (No `create-expo-app` needed — `package.json`, `app.json`, and `babel.config.js` are
   already here.)

2. **Create a Firebase project**
   - Firebase console → Add project
   - Enable **Firestore Database** (production mode) and **Authentication → Email/Password**
   - Project settings → Web app → copy the config object

3. **Add your Firebase config**
   Paste your config into `firebase/config.js`, replacing the `YOUR_...` placeholders.

4. **Deploy security rules and indexes**
   ```bash
   npm install -g firebase-tools   # if you don't have it
   firebase login
   firebase use --add               # select your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   Alternatively, skip this and just run the app — Firestore will print a console link
   to create the one composite index it needs (on `isShared`+`date`, used by the Shared
   tab) the first time that query runs.

5. **Run it**
   ```bash
   npx expo run:android      # full native build
   # or
   npx expo start             # then open in Expo Go for faster iteration
   ```

6. **Populate test data**
   Sign up in the app, then go to **Settings → Developer → Load Sample Data**. This seeds
   ~45 expenses, 2 budgets, and a settlement across a couple of months so every tab has
   real data to look at immediately.

## Project structure

See the in-conversation design notes for the full breakdown — in short:

- `firebase/` — Firebase init + Firestore collection path helpers
- `src/theme/`, `src/context/` — visual identity, theme (light/dark/system), auth state
- `src/hooks/` — one React Query hook module per Firestore collection (CRUD + caching)
- `src/lib/` — pure functions: split math, budget/balance/dashboard aggregations, CSV/XLSX export
- `src/components/`, `src/screens/` — organized by tab (dashboard, expenses, budget, shared, settings)

## Data model

Everything lives under `users/{uid}/...` — expenses, categories, accounts, budgets, and
settlements are all subcollections scoped to the authenticated user. See `firestore.rules`
for the (single) ownership rule that covers all of it.

Budgets, balances, and dashboard totals are **computed client-side** from cached expense
data rather than stored as running counters — no Cloud Functions required, and no
write-amplification to keep in sync.
