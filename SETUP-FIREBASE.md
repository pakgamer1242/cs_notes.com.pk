# Turning on accounts and the complaints dashboard (Firebase setup)

This takes about 10–15 minutes and costs nothing on Firebase's free "Spark" plan.
Until you finish, the site works exactly as before: notes are saved on each device, the complaint box keeps reports on the visitor's device, and no account buttons appear.

Firebase's screens change from time to time, so button names may differ slightly. The idea of each step stays the same.

> **Already did the earlier setup?** You only need to **publish the newest rules** (step 5b, needed for profile photos to sync) and upload the files. If you haven't yet, also do step **7** (make yourself an admin).

## 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Add project** and give it a name (for example `cs-notes`).
3. You can switch **Google Analytics off**. This site doesn't need it.

## 2. Register your website and copy its settings

1. On the project's home page, click the **web** icon (`</>`) to add a web app. Name it anything.
   You do **not** need Firebase Hosting, because your site lives on GitHub.
2. Firebase shows a block of code with a `firebaseConfig` object. Copy these four values into **`cloud-config.js`**:

   | In Firebase     | In `cloud-config.js` |
   |-----------------|----------------------|
   | `apiKey`        | `apiKey`             |
   | `authDomain`    | `authDomain`         |
   | `projectId`     | `projectId`          |
   | `appId`         | `appId`              |

   These values are public by design (they only say *which* project to talk to). Your data is protected by the rules in step 5, not by hiding them.

## 3. Switch on email + password sign-in

1. In the left menu open **Build → Authentication** and click **Get started**.
2. Under **Sign-in method**, enable **Email/Password** (leave "Email link" off).

## 4. Allow your website's address

1. Still in Authentication, open **Settings → Authorized domains**.
2. Click **Add domain** and add your GitHub Pages domain, for example `yourname.github.io`
   (just the domain, no `https://` and no folder name).

If you skip this, sign-in fails with a message about the website's address not being allowed.

## 5. Create the database and publish the rules

**5a.** Open **Build → Firestore Database** and click **Create database**. Choose a location close to your users (you can't change it later) and start in **production mode**.

**5b.** Open the **Rules** tab, delete what's there, paste the whole contents of **`firestore.rules`**, and click **Publish**. The editor underlines any mistakes before you publish.

> **Important:** this version of the rules replaces the earlier one. If you published rules before, publish these again. Without them, complaints are refused (they stay "Not sent yet" on the visitor's device) and profile photos stay on the device they were added on.

What the rules do:

- Each signed-in person can read and write **only their own** notes and **their own profile photo** (one small picture, size-limited and checked).
- **Anyone** can *send* a complaint, once. They can't read, change or delete any complaint, including their own after sending.
- Only an **admin** (step 7) can read complaints, change their status or note, and delete them.
- Everything else is closed.

## 6. Upload and test accounts

1. Upload the files to GitHub (see "Files to upload" below) and wait a few minutes for GitHub Pages to update.
2. Hard-refresh the site (**Ctrl+F5**, or **Cmd+Shift+R** on Mac).
3. Click your profile chip (top right) → **Create account**.
4. Make a note in any topic, then check **Firestore Database → Data**: `users → (an id) → topics → …` should appear a few seconds later.
5. Open the site on another device, sign in, and your note appears there.

## 7. Make yourself the admin (to see the complaints panel)

Anyone can *send* complaints, but only accounts you list as admins can read them.

1. On the live site, create your own account (or sign in) so you exist in Firebase.
2. In the Firebase console open **Build → Authentication → Users** and copy your **User UID**.
3. Open **Firestore Database → Data → Start collection**. Name it exactly `admins`.
4. For **Document ID**, paste your **User UID**. Add any one field (for example `email`, type string, your email) and save.
5. Reload the site and sign in. Open your profile chip: your account card now has a **Complaints panel** button.

To add another admin later, add another document to `admins` with their UID. To remove one, delete their document.

## The complaints panel

- **Where do complaints go?** Straight to your Firebase database. Nothing is kept on the visitor's device once it is sent. If a visitor is offline, their report waits on their device and is sent automatically when they're back online.
- **What's in a report?** What they wrote, the kind of problem, an optional name/email, and (if they left the box ticked) the page they were on, their browser/platform/screen size and a check of which features their browser supports. Never their notes.
- **Sorting:** click a column heading, or use **Sort by** (date, type, status, page, device).
- **Filtering:** search any words (also matches email, page and device), pick a status or type, or click a status chip (New / In progress / Resolved / Dismissed).
- **Bulk actions:** tick several rows, then **Mark as** a status, or **Delete**.
- **One report:** click it to read everything, set its status, write a private note, move to the Previous/Next report, or delete it.
- **Export:** **Export CSV** (opens in Excel or Google Sheets) and **Export JSON**, following your current filters. Cells that start with `=`, `+`, `-` or `@` are marked so a spreadsheet can't run them as formulas.
- **Compatibility insights:** counts which browsers/devices and which unsupported features appear most among reports that are still new or in progress. This is the part meant to guide your cross-platform work.
- **Size:** the panel loads the newest 200 reports; **Load older reports** fetches more.

### Spam
The complaint form is open to everyone, so someone could send junk. It already has a hidden trap field that catches simple bots, and the rules limit the size of every report. If you ever get flooded, delete junk in bulk from the panel. Firebase also offers a stronger protection called **App Check** (set up in the console); it can be added later if you need it.

## Files to upload

Upload **all** of these to the same folder on GitHub (replace the old ones):

`index.html`, `style.css`, `app.js`, `nav.js`, `avatar.js`, `print.js`, `feedback.js`, `cloud.js`, `admin.js`, `cloud-config.js` (with your values), `data-reference.js`, `data-grade11.js`, `data-grade12.js`, `questions-grade11.js`, `questions-grade12.js`.

`SETUP-FIREBASE.md` and `firestore.rules` are for you: the site doesn't load them, but keep them in the repo if you like. The rules only take effect when you paste them into the Firebase console (step 5b).

## Profile photos, password and printing

- **Profile photo:** open your profile (top right) and tap the camera. Choose or drop a picture, drag and zoom it into the round frame, and save. It is made small and square inside your browser. A guest profile keeps it on that device only; a signed-in account keeps it in the cloud, so it appears on your other devices too. Pictures that aren't small, plain JPEG/PNG/WebP are ignored.
- **Change password:** signed-in accounts have a **Change password** button on the account card. It asks for the current password first. Guest profiles have no password.
- **Printing:** the **Print** button on every topic (and the printer button in the toolbar) lets you print this topic, a whole unit, or topics you pick from any section, optionally with short-question answers and your own notes. Choose **Same as the screen** or **Paper-friendly**, and A4 or Letter. In the browser's print window choose **Save as PDF** to keep a file. Pressing Ctrl+P on a topic page prints that topic the same way. If colours are missing, turn on **Background graphics** in the print window; if the page edges stay white in your browser, use the Paper-friendly look.

## Good to know

- **Forgot password:** "Forgot password?" on the sign-in screen sends a reset email from Firebase's own address, so ask people to check their spam folder.
- **What syncs to an account:** notes, saved links and video links. **Images stay on the device** they were added on. Layout choices are also per device, on purpose.
- **Two devices edit the same topic:** nothing is lost. Both versions are kept.
- **Signing out** removes that account's notes from the device. If something hasn't synced yet, you're warned first.
- **Deleting an account** (profile chip → **More** → *Delete account and cloud data*) removes the person's synced notes and login.
- **Free-plan limits:** the Spark plan has daily read/write limits, plenty for a study site. Check Firebase's pricing page for current numbers.
- **Privacy:** the personal data stored is each person's email, optional display name and notes, plus whatever people write in complaints (and an optional contact). Keep it to that, delete complaints once handled, and mention it to your users.

## If something goes wrong

| What you see | Usually means |
|---|---|
| Accounts don't appear at all | `cloud-config.js` values are empty, or the file wasn't uploaded |
| "The website's address isn't allowed" | Step 4: add `yourname.github.io` to Authorized domains |
| "Email sign-in isn't switched on" | Step 3 |
| "The cloud database rejected this" / sync problem | Step 5: rules not published, or the database wasn't created |
| Complaints stay "Not sent yet" | Step 5b: publish the **new** rules (the older ones refuse these reports) |
| No "Complaints panel" button | Step 7: the `admins` document ID must be exactly your User UID; sign out and back in after adding it |
| Panel says the database rejected the request | You're signed in but not listed in `admins`, or the rules aren't published |
| Photo says "saved on this device" but never syncs | Publish the newest `firestore.rules` (step 5b); older rules have no place for profile photos |
| "Firebase settings … look wrong" | A value in `cloud-config.js` was copied incorrectly |
| "Couldn't load the sign-in service" | No internet, or a network that blocks Google's servers |
