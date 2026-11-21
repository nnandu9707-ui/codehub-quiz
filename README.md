# CODEHUB v2

A student quiz website with C, Java, Python, DBMS, Aptitude, explanations, Supabase email login and a live leaderboard.

## Included files
- `index.html` — website structure
- `style.css` — responsive design
- `app.js` — quiz logic, explanations, auth and leaderboard
- `config.js` — Supabase project URL and publishable key
- `supabase.sql` — database tables, trigger and Row Level Security policies
- `about.html`, `privacy.html`, `contact.html`, `terms.html` — starter information pages

## 1. Create a Supabase project
1. Create a project at https://supabase.com/dashboard
2. Choose a strong database password and keep it private.
3. Open Project Settings > API (or Connect/API keys, depending on dashboard layout).
4. Copy the Project URL and the publishable key (or legacy anon public key).
5. Paste them into `config.js`.
6. NEVER use the `service_role` key or database password in browser files.

## 2. Create the database
1. In Supabase, open SQL Editor > New query.
2. Open `supabase.sql` from this folder.
3. Paste the complete SQL and click Run.
4. Confirm tables `profiles`, `scores` and view `leaderboard` exist.

## 3. Configure email login
1. In Supabase, open Authentication > URL Configuration.
2. After deployment, set Site URL to your actual website URL.
3. Add that same URL to Redirect URLs.
4. Email confirmation is normally enabled by default on hosted Supabase projects. A new student may need to click the email confirmation link before logging in.

## 4. Upload source code to GitHub
1. Download and extract `CODEHUB_v2_project.zip`.
2. Open your GitHub repository `codehub-quiz`.
3. Click Add file > Upload files.
4. Upload every file from the extracted `CODEHUB_v2` folder into the repository root (not inside an extra nested folder).
5. If GitHub says `index.html` already exists, the new file should replace the old version.
6. Commit changes to the `main` branch.

## 5. Host the website
Important: GitHub Pages is for personal/project pages and is not allowed for running an online business or commercial SaaS. It also should not be used for sensitive transactions. Since this project is intended to grow into a login-based monetized quiz service, use a host whose current terms permit your intended use instead of using GitHub Pages for the commercial service.

A beginner-friendly static deployment option is Cloudflare Pages:
1. Create/sign in at https://dash.cloudflare.com/
2. Open Workers & Pages (or Pages) > Create application > Pages > Connect to Git.
3. Connect GitHub and authorize access to the `codehub-quiz` repository.
4. Select the `codehub-quiz` repository.
5. For a plain HTML/CSS/JS project, use no framework preset. Leave the build command blank and set the output/build directory to `/` or the repository root as the UI requests.
6. Deploy. Cloudflare will provide a `*.pages.dev` website URL.
7. In Supabase > Authentication > URL Configuration, set Site URL and Redirect URL to that exact `https://...pages.dev/` URL.
8. Open the live site and test sign-up, email confirmation, login, quizzes and leaderboard.

Cloudflare Pages supports Git-connected deployments and static assets; check its current plan limits and terms before commercial launch.

## 6. Grant Premium manually (temporary MVP)
The Premium lock is a starter/manual entitlement, not an online checkout. Do not accept payment based only on a screenshot or a client-side button.
1. Independently verify the payment in your payment provider dashboard.
2. In Supabase > Authentication > Users, copy the customer's UUID.
3. Open SQL Editor and run:
   `update public.profiles set is_premium = true where id = 'CUSTOMER-UUID';`
4. The user logs out and back in, then checks Premium access.

## Important limitations before charging customers
- The sample Premium questions are in browser JavaScript. A visitor can inspect downloaded files, so this is NOT secure delivery of paid content.
- A real paid product needs a server-side payment order + signature verification (for example a Supabase Edge Function), a verified payment webhook, and server-side premium question delivery. Never put payment secrets in `config.js` or `app.js`.
- Scores are currently submitted by the browser. This is suitable as a learning/demo leaderboard, not a tamper-proof competition. For prize-bearing leaderboards, validate answers and scores on a server.
- The current Premium UI uses a manual admin flag. No payment gateway is connected.
- AdSense is not included. Apply only after adding substantial original content, clear navigation and accurate policy/contact pages. Approval and revenue are not guaranteed.

## Safety
Never share passwords, email OTPs, database passwords, Supabase service-role keys, or payment gateway secret keys with anyone.
