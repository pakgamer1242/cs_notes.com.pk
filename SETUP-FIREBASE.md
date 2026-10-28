# Turning on accounts (Firebase setup)

This takes about 10–15 minutes and costs nothing on Firebase's free "Spark" plan.
Until you finish, the site works exactly as it does now: notes are saved on each device and no account buttons appear.

Firebase's screens change from time to time, so button names may differ slightly. The idea of each step stays the same.

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

   These values are public by design (they only say *which* project to talk to). Your data is protected by the rules in step 5, not by hiding them. Other values in that block are not needed.

## 3. Switch on email + password sign-in

1. In the left menu open **Build → Authentication** and click **Get started**.
2. Under **Sign-in method**, enable **Email/Password** (leave "Email link" off).

## 4. Allow your website's address

1. Still in Authentication, open **Settings → Authorized domains**.
2. Click **Add domain** and add your GitHub Pages domain, for example `yourname.github.io`
   (just the domain, no `https://` and no folder name).

If you skip this, sign-in fails with a message about the website's address not being allowed.

## 5. Create the database and publish the rules

1. Open **Build → Firestore Database** and click **Create database**.
2. Choose a location close to your users (you can't change it later) and start in **production mode**.
3. Open the **Rules** tab, delete what's there, paste the whole contents of **`firestore.rules`**, and click **Publish**.
   The editor underlines any mistakes before you publish.

What the rules do:

- Each signed-in person can read and write **only their own** notes.
- The `complaints` section is already included. Anyone can *send* a complaint but nobody can read or delete them from the website, so you read them in this console. (The sending code is the next step, so you only paste the rules once.)
- Everything else is closed.

## 6. Upload and test

1. Upload the changed files to GitHub (see the list below) and wait a few minutes for GitHub Pages to update.
2. Hard-refresh the site (**Ctrl+F5**, or **Cmd+Shift+R** on Mac).
3. Click your profile chip (top right) → **Create account**.
4. Make a note in any topic, then check **Firestore Database → Data**: you should see `users → (an id) → topics → …` appear a few seconds later.
5. Open the site on another device, sign in, and your note appears there.

Files to upload: `index.html`, `style.css`, `app.js`, `cloud.js`, `cloud-config.js` (with your values), plus `SETUP-FIREBASE.md` and `firestore.rules` if you want them in the repo.

## Good to know

- **Forgot password:** "Forgot password?" on the sign-in screen sends a reset email. Firebase sends it from its own address, so ask people to check their spam folder.
- **Verification email:** new accounts are sent one. It is a gentle reminder, not a requirement.
- **What syncs:** notes, saved links and video links. **Images stay on the device** they were added on (they are large). Layout choices (sidebar minimized, etc.) are also per device, on purpose.
- **Two devices edit the same topic:** nothing is lost. Both versions are kept, with the second one under a "— edits from this device —" line.
- **Offline:** you can keep working. Changes sync when the connection returns.
- **Signing out** removes that account's notes from the device. If something hasn't synced yet, you're warned first.
- **Deleting an account** (profile chip → **More** → *Delete account and cloud data*) removes the person's synced notes and their login.
- **Free-plan limits:** the Spark plan has daily read/write limits, which are plenty for a study site. Check Firebase's pricing page for current numbers.
- **Privacy:** the only personal data stored is each person's email, optional display name and their notes. Keep it that way, and mention it to your users.

## If something goes wrong

| What you see | Usually means |
|---|---|
| Accounts don't appear at all | `cloud-config.js` values are empty, or the file wasn't uploaded |
| "The website's address isn't allowed" | Step 4: add `yourname.github.io` to Authorized domains |
| "Email sign-in isn't switched on" | Step 3 |
| "The cloud database rejected this" / sync problem | Step 5: the rules aren't published, or the database wasn't created |
| "Firebase settings … look wrong" | A value in `cloud-config.js` was copied incorrectly |
| "Couldn't load the sign-in service" | No internet, or a network that blocks Google's servers |
