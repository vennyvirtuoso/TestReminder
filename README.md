# 🎓 IIT Bombay Placement Tracker

A private, client-side web application to track the companies you have applied to on the **IIT Bombay Placement Portal** ([campus.placements.iitb.ac.in/applicant/application](https://campus.placements.iitb.ac.in/applicant/application)).

Designed specifically for IIT Bombay students during Phase 1 & Phase 2 placements, with:
- **Checkbox for "Test Given / Not Given"** for each company with date & platform logging.
- **Dedicated Comment Section** for each company (OA questions, interview notes, prep tips).
- **100% Client-Side Privacy**: Your LDAP ID, credentials, and notes are stored **strictly in your browser** (`localStorage`). Nothing is ever sent to any remote server or AI assistant.
- **Ready for Vercel deployment** with 1 click.

---

## ✨ Features

- 📋 **List Applied Companies**: See all companies, roles/profiles, JAF IDs, and statuses in one clean dashboard.
- ⏳ **Test Given / Test Not Given Tracker**:
  - One-click toggle between **Given** (Green) and **Not Given / Pending** (Amber).
  - Quick filter buttons to isolate tests that are still pending.
  - Optional logging of test platforms (HackerRank, Mettl, CodeSignal, Unstop) and test dates.
- 💬 **Company-Specific Comment Section**:
  - Add timestamps, interview questions asked, OA difficulty, coding problems, or follow-ups.
  - Expandable drawer view for dense analysis or card view.
- 🔒 **Zero-Knowledge / Local-Only LDAP**:
  - Your LDAP ID is entered manually by you and stays exclusively in your local device storage.
  - No database or backend can access your placement data.
- 🔄 **3 Seamless Ways to Sync from IITB Portal**:
  1. **1-Click Bookmarklet**: Drag the bookmarklet into your Chrome/Firefox bookmarks bar. While on `campus.placements.iitb.ac.in/applicant/application`, click it to capture all applied companies to clipboard!
  2. **Copy & Paste Table**: Select table on the portal, press `Cmd+C`, and paste it in the app's importer.
  3. **DevTools Console One-Liner**: Copy all rows in 1 second via DevTools console.
- 📊 **Stats & Conversions**:
  - Total applied, test completion percentage, pending tests counter, shortlisted pipeline.
- 📁 **Data Export**:
  - One-click Export to CSV (Excel compatible) and JSON backup.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# Visit http://localhost:3000
```

---

## ☁️ Deploying to Vercel

### Option 1: Deploy with Vercel CLI (Fastest)

Since `vercel` CLI is installed:

```bash
# In the project directory:
vercel
```

Follow the quick prompts:
1. `Set up and deploy?` **Y**
2. `Which scope?` Select your account
3. `Link to existing project?` **N**
4. `Project name?` e.g., `iitb-placement-tracker`
5. `Directory?` `./`
6. `Want to modify settings?` **N**

To deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub (Recommended for automatic updates)

1. Create a repository on your GitHub account (public or private).
2. Push your project:
   ```bash
   git init
   git add .
   git commit -m "feat: IIT Bombay placement tracker app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/iitb-placement-tracker.git
   git push -u origin main
   ```
3. Go to [vercel.com/new](https://vercel.com/new).
4. Import your GitHub repository.
5. Framework preset will automatically be detected as **Next.js**. Click **Deploy**!

---

## 🔒 Privacy & Security Architecture

1. **No External Network Calls**: The app does not transmit your LDAP ID, passwords, or company applications to any backend service.
2. **Local Storage**: All data lives in your browser's `localStorage` under `iitb_placement_applications_v1` and `iitb_ldap_user_v1`.
3. **Multi-User Isolation**: Even when hosted on a public Vercel URL, each student who visits the link has their own isolated local browser storage.
