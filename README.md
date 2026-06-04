# Initiative Hub — GitHub Pages Setup Guide

## Overview

The Hub is a static website hosted on GitHub Pages.  
Data comes from a CSV file committed to the repository.  
Monthly update = export list to CSV, upload to GitHub. Done.

```
SharePoint List ──(you export once/month)──▶ CSV file ──▶ GitHub repo ──▶ GitHub Pages
```

---

## Part 1: Create the GitHub Repository (10 minutes)

### Step 1 — Create the repository

1. Go to **github.com** → sign in
2. Click **+** (top right) → **New repository**
3. Settings:
   - Name: `btp-initiative-hub`
   - Visibility: Private (or Internal for organization)
   - Check: "Add a README file"
4. Click **Create repository**

### Step 2 — Upload the Hub files

1. In your repository, click **Add file** → **Upload files**
2. Drag and drop these files from the package:

```
index.html
styles.css
app.js
config.js
data/
  └── initiatives.csv
assets/
  └── sap-logo.svg
  └── icons/
      ├── ai.svg
      ├── build.svg
      ├── cross.svg
      ├── integration.svg
      ├── mobile.svg
      └── partners.svg
```

3. Commit message: `Initial deployment`
4. Click **Commit changes**

### Step 3 — Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)`
4. Click **Save**
5. Your site will be live at:
   ```
   https://YOUR_ORG.github.io/btp-initiative-hub/
   ```

Your Hub is now live.

---

## Part 2: Monthly Update Process (2 minutes)

When new initiatives are added to the SharePoint List:

### Step 1 — Export the list to CSV

1. Open your SharePoint List
2. Click **Export** → **Export to CSV** (in the toolbar)
3. An Excel file downloads. Open it in Excel.
4. **File** → **Save As** → choose **CSV UTF-8 (Comma delimited)**
5. Name it `initiatives.csv`

> **Tip:** Make sure the column headers match: `Category, Título, Lead, Description, Link, Icon`

### Step 2 — Upload to GitHub

1. Go to your repository on GitHub
2. Navigate to the `data/` folder
3. Click **Add file** → **Upload files**
4. Drag your new `initiatives.csv` into the upload area
5. Commit message: `Update initiatives - June 2026` (or whatever month)
6. Click **Commit changes**

GitHub Pages redeploys automatically. Your Hub is updated within 1-2 minutes.

---

## That's it.

No pipelines. No secrets. No Azure. No Power Automate.

**Monthly effort: 2 minutes.**

---

## Quick Reference

| Task | How | When |
|------|-----|------|
| View the Hub | Visit your GitHub Pages URL | Anytime |
| Add new initiatives | Export list → upload CSV to GitHub | Monthly |
| Add a new category icon | Upload SVG to `assets/icons/`, update `config.js` | Rare |
| Change the CTA button link | Edit `config.js` → `ctaUrl` field | Once |
| Embed in SharePoint | Add iframe web part with your Pages URL | Once |

---

## SharePoint Embedding (optional)

To embed the Hub inside a SharePoint page:

1. Edit the SharePoint page
2. Add an **Embed** web part
3. Paste:
   ```
   <iframe src="https://YOUR_ORG.github.io/btp-initiative-hub/" width="100%" height="900" frameborder="0" style="border:none;"></iframe>
   ```
4. Publish

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Hub shows old data after upload | Hard refresh: Ctrl+Shift+R |
| CSV export has wrong columns | Ensure headers are: Category, Título, Lead, Description, Link, Icon |
| New category shows no icon | Upload SVG to `assets/icons/`, add entry to `config.js` |
| Site returns 404 | Check Pages is enabled on `main` branch, root folder |
