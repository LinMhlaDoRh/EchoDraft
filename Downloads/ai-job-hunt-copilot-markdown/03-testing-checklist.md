# AI Job-Hunt Copilot: Testing Checklist

## Purpose

This document lists the tests you should perform while building the AI Job-Hunt Copilot project.

The goal is to catch:

- Bugs
- Broken API routes
- Authentication problems
- Database errors
- File upload issues
- AI response problems
- Frontend state bugs
- Deployment issues
- Security mistakes

Use this checklist as you complete each build step.

---

# Phase 1: Planning and Architecture Tests

## Step 1: Test the MVP Scope

Before coding, check that the first version is not too big.

### What to Test

- Can the app be explained in one sentence?
- Can the first version be built without payment systems?
- Can the first version work with only one AI API?
- Can the first version work without advanced vector search?
- Can the first version be completed in a reasonable time?

### Pass Condition

The MVP should include only:

- Authentication
- Resume upload
- Job description input
- AI match report
- Missing skills
- Cover letter generation
- Basic dashboard

### Common Mistake

Trying to include too many advanced features before the basic app works.

---

## Step 2: Test the User Flow

Make sure the user flow makes sense before designing the database.

### What to Test

Walk through the app as if you are the user:

1. Can the user register?
2. Can the user upload a resume?
3. Can the user add a job description?
4. Can the user generate a match report?
5. Can the user generate a cover letter?
6. Can the user view saved results later?

### Pass Condition

You should be able to describe the full user journey without confusion.

### Common Mistake

Building separate features that do not connect smoothly.

---

## Step 3: Test the Database Design

Check that your tables support the MVP features.

### What to Test

For each table, ask:

- Does this table have a user ID where needed?
- Can each resume belong to one user?
- Can each job description belong to one user?
- Can each match report connect a resume and job description?
- Can each cover letter connect to a match report?
- Are timestamps included?
- Are large AI responses stored in suitable text or JSON columns?

### Pass Condition

The database should support the full flow:

```text
User → Resume → Job Description → Match Report → Cover Letter
```

### Common Mistake

Forgetting relationships between tables.

---

# Phase 2: Project Setup Tests

## Step 4: Test the Laravel Backend Setup

After creating the Laravel project, confirm the backend runs correctly.

### What to Test

Run:

```bash
php artisan serve
```

Then visit:

```text
http://localhost:8000
```

Also test:

```bash
php artisan route:list
php artisan migrate
```

### Pass Condition

- Laravel starts without errors
- Routes can be listed
- Migrations run successfully
- `.env` file is configured correctly

### Error Tests

Try intentionally breaking the database password in `.env`.

Expected result:

- Laravel should show a database connection error

Then fix the password and confirm the app works again.

### Common Mistake

Forgetting to generate the Laravel app key:

```bash
php artisan key:generate
```

---

## Step 5: Test the Next.js Frontend Setup

After creating the Next.js project, confirm the frontend runs correctly.

### What to Test

Run:

```bash
npm run dev
```

Then visit:

```text
http://localhost:3000
```

### Pass Condition

- Next.js starts without errors
- The homepage loads
- Tailwind styles work
- TypeScript does not show major errors

### Error Tests

Temporarily create a TypeScript error in a component.

Expected result:

- The dev server should show the error clearly

Then fix the error.

### Common Mistake

Installing UI libraries before confirming the base project works.

---

## Step 6: Test Laravel Connection to Supabase PostgreSQL

After connecting Laravel to Supabase, test the database connection.

### What to Test

Run:

```bash
php artisan migrate
```

Then check Supabase to confirm that tables were created.

### Pass Condition

- Laravel connects to Supabase
- Migrations run successfully
- Tables appear in Supabase
- No SSL/database connection errors appear

### Error Tests

Test these situations:

- Wrong database password
- Wrong database host
- Wrong database port
- Missing database name

Expected result:

- Laravel should fail clearly with a connection error

### Common Mistake

Using the wrong Supabase connection string or forgetting PostgreSQL uses port `5432`.

---

# Phase 3: Authentication Tests

## Step 7: Test Laravel Authentication

Once Laravel Sanctum is set up, test the authentication API.

### What to Test

Test these endpoints:

```text
POST /api/register
POST /api/login
POST /api/logout
GET /api/user
```

Use Postman, Insomnia, Thunder Client, or a simple frontend form.

### Successful Tests

Check that:

- A new user can register
- A registered user can log in
- The API returns the logged-in user
- The user can log out
- Passwords are hashed in the database

### Error Tests

Try:

- Registering with an empty name
- Registering with an invalid email
- Registering with an existing email
- Registering with a short password
- Logging in with the wrong password
- Accessing `/api/user` while logged out
- Logging out while not authenticated

### Pass Condition

- Invalid requests return proper validation errors
- Protected routes reject unauthenticated users
- Successful login returns the correct auth response

### Common Mistake

Returning raw user data with sensitive fields.

---

## Step 8: Test Frontend Authentication

After connecting Next.js to Laravel auth, test the full login flow in the browser.

### What to Test

Use the frontend to:

- Register
- Log in
- Visit the dashboard
- Refresh the page
- Log out
- Try accessing the dashboard while logged out

### Error Tests

Try:

- Wrong email
- Wrong password
- Empty form fields
- Weak password
- Duplicate registration email
- Refreshing after login
- Opening the dashboard in a new tab

### Pass Condition

- Logged-in users can access the dashboard
- Logged-out users are redirected to login
- Form errors display clearly
- Auth state does not randomly disappear
- Logout clears the session/token

### Common Mistake

Only testing login once and not testing refresh/logout behavior.

---

# Phase 4: Resume Upload Tests

## Step 9: Test Resume Upload API

After creating the Laravel resume upload endpoint, test file uploads.

### What to Test

Test:

```text
POST /api/resumes
```

Upload a valid PDF resume.

### Successful Tests

Check that:

- The file uploads successfully
- The file is stored in the correct location
- A database record is created
- The resume belongs to the logged-in user
- Text is extracted from the file
- The API returns a useful response

### Error Tests

Try uploading:

- No file
- A `.txt` file
- A `.jpg` file
- A very large PDF
- A corrupted PDF
- A PDF with no selectable text
- A file while logged out

### Pass Condition

- Valid PDF files are accepted
- Invalid files are rejected
- File size limits work
- Unauthenticated users cannot upload
- The backend does not crash on corrupted files

### Common Mistake

Not handling PDFs that are image-based and have no extractable text.

---

## Step 10: Test Resume Upload UI

After building the frontend upload page, test upload behavior in the browser.

### What to Test

Check that the UI handles:

- Selecting a file
- Uploading a file
- Showing loading state
- Showing success message
- Showing validation errors
- Showing uploaded resumes

### Error Tests

Try:

- Clicking upload without selecting a file
- Uploading an unsupported file type
- Uploading a large file
- Uploading while logged out
- Refreshing after upload
- Uploading the same resume twice

### Pass Condition

- The UI does not freeze
- The user sees clear feedback
- Uploaded resumes appear after upload
- Invalid files show helpful errors

### Common Mistake

Not disabling the upload button while the upload is in progress.

---

# Phase 5: Job Description Tests

## Step 11: Test Job Description API

After creating the job description API, test saving job descriptions.

### What to Test

Test these endpoints:

```text
POST /api/jobs
GET /api/jobs
GET /api/jobs/{id}
DELETE /api/jobs/{id}
```

### Successful Tests

Check that:

- A user can save a job description
- The job belongs to the logged-in user
- A user can list their jobs
- A user can view one job
- A user can delete their job

### Error Tests

Try:

- Empty job title
- Empty company name
- Empty description
- Very short job description
- Very long job description
- Accessing another user’s job
- Creating a job while logged out

### Pass Condition

- Validation errors are returned correctly
- Users only access their own jobs
- Long descriptions do not break the app
- Empty fields are rejected

### Common Mistake

Forgetting to check ownership of job descriptions.

---

## Step 12: Test Job Description UI

After building the job description form, test it in the browser.

### What to Test

Check that the user can:

- Add a job title
- Add a company name
- Paste a job description
- Submit the form
- See the saved job in the dashboard
- View job details later

### Error Tests

Try:

- Submitting an empty form
- Pasting a very long job description
- Refreshing after submit
- Submitting the form twice quickly
- Losing internet connection during submit

### Pass Condition

- Form validation works
- Loading state appears
- Duplicate accidental submissions are prevented
- Saved job descriptions display correctly

### Common Mistake

Not preventing double-submit when the user clicks the button multiple times.

---

# Phase 6: Gemini AI Analysis Tests

## Step 13: Test Gemini API Service

After creating the Laravel Gemini service, test it separately before connecting it to the app.

### What to Test

Create a simple test route or command that sends a short prompt to Gemini Flash.

Example prompt:

```text
Return JSON with the fields: summary, skills, and recommendations.
```

### Successful Tests

Check that:

- Laravel can call Gemini
- API key is loaded from `.env`
- Response is received
- Response can be parsed
- Errors are logged safely

### Error Tests

Try:

- Missing API key
- Invalid API key
- Empty prompt
- Very long prompt
- No internet connection
- Invalid JSON response from AI
- API rate limit response

### Pass Condition

- The app does not crash when Gemini fails
- Errors are handled cleanly
- The API key is never exposed to the frontend
- AI responses can be parsed safely

### Common Mistake

Assuming the AI will always return perfect JSON.

---

## Step 14: Test Resume AI Analysis

After connecting Gemini to resume analysis, test different resume types.

### What to Test

Upload resumes with:

- Clear skills section
- No skills section
- Projects section
- No projects section
- Very short resume
- Very long resume
- Poor formatting
- Missing education section

### Successful Tests

Check that Gemini returns:

- Summary
- Technical skills
- Soft skills
- Projects
- Education
- Weak bullets
- Improvement suggestions

### Error Tests

Try:

- Resume text is empty
- Resume text is too long
- Resume text has strange symbols
- Gemini returns incomplete JSON
- Gemini times out

### Pass Condition

- Resume analysis is saved in the database
- Missing fields are handled gracefully
- The user sees a helpful message if analysis fails
- The same resume is not analyzed repeatedly without reason

### Common Mistake

Not saving AI results and calling Gemini again every time the page loads.

---

## Step 15: Test Job Description AI Analysis

After creating job description analysis, test different job descriptions.

### What to Test

Use job descriptions for:

- Junior developer
- Backend developer
- Frontend developer
- Full-stack developer
- Internship
- Data analyst
- Poorly written job post
- Very short job post

### Successful Tests

Check that Gemini extracts:

- Required skills
- Preferred skills
- Responsibilities
- Seniority level
- Important keywords
- Soft skills

### Error Tests

Try:

- Empty job description
- Very short job description
- Very long job description
- Job description with irrelevant text
- AI response missing required fields

### Pass Condition

- Valid job descriptions are analyzed correctly
- Bad inputs return clear errors
- AI output is saved
- The system does not crash on incomplete AI output

### Common Mistake

Not validating the job description before sending it to AI.

---

# Phase 7: Match Report Tests

## Step 16: Test Match Report API

After building the match report endpoint, test resume-job comparison.

### What to Test

Test:

```text
POST /api/jobs/{id}/match
```

Use:

- A resume that strongly matches the job
- A resume that partially matches the job
- A resume that does not match the job
- A job with many skills
- A job with vague requirements

### Successful Tests

Check that the report includes:

- Match score
- Matching skills
- Missing skills
- Weak areas
- Recommendations
- Suggested resume improvements

### Error Tests

Try:

- Matching without a resume
- Matching a job that does not exist
- Matching another user’s job
- Matching another user’s resume
- Gemini timeout during matching
- AI returns invalid score
- AI returns missing fields

### Pass Condition

- Match reports are saved
- Users can only match their own data
- Match score is within `0–100`
- Missing data does not crash the app
- Failed AI calls return useful errors

### Common Mistake

Trusting the AI score without validating it.

---

## Step 17: Test Match Report UI

After building the report page, test how reports display.

### What to Test

Check that the UI shows:

- Score clearly
- Matching skills
- Missing skills
- Recommendations
- Resume improvements
- Loading states
- Error states

### Error Tests

Try:

- Opening a report that does not exist
- Opening another user’s report
- Refreshing the report page
- Viewing a report with missing fields
- Viewing a report with a very long recommendation list

### Pass Condition

- The report is readable
- The UI handles missing data
- The page works after refresh
- Long content does not break the layout
- Unauthorized reports are blocked

### Common Mistake

Designing only for perfect AI output.

---

# Phase 8: Cover Letter Tests

## Step 18: Test Cover Letter API

After building cover letter generation, test it with different match reports.

### What to Test

Test:

```text
POST /api/matches/{id}/cover-letter
```

Use match reports with:

- High match score
- Medium match score
- Low match score
- Missing company name
- Missing job title
- Few matching skills

### Successful Tests

Check that the cover letter:

- Mentions the correct company
- Mentions the correct role
- Uses relevant skills
- Is professional
- Is not too long
- Does not invent fake experience
- Is saved in the database

### Error Tests

Try:

- Generating for a match that does not exist
- Generating for another user’s match
- Gemini timeout
- Empty AI response
- Repeated generation requests

### Pass Condition

- Cover letter is generated and saved
- Users can only access their own cover letters
- The app handles AI failure
- The cover letter does not include fake claims

### Common Mistake

Letting the AI invent skills or experience not found in the resume.

---

## Step 19: Test Cover Letter UI

After building the frontend cover letter page, test user actions.

### What to Test

Check that the user can:

- Generate a cover letter
- View it
- Copy it
- Regenerate it
- Return to the match report

### Error Tests

Try:

- Clicking generate multiple times
- Copying before generation finishes
- Refreshing the page
- Viewing a failed generation
- Viewing very long cover letter text

### Pass Condition

- Buttons work correctly
- Loading state is clear
- Copy button works
- Failed generation shows a helpful message
- Long text displays cleanly

### Common Mistake

Not disabling the generate button during generation.

---

# Phase 9: Dashboard Tests

## Step 20: Test Main Dashboard

After building the dashboard, test whether it gives a useful overview.

### What to Test

Check that the dashboard shows:

- Uploaded resumes
- Saved job descriptions
- Recent match reports
- Recent cover letters
- Quick action buttons

### Error Tests

Test dashboard states:

- New user with no data
- User with one resume
- User with many resumes
- User with many job descriptions
- User with failed AI reports
- Slow API response
- Logged-out user

### Pass Condition

- Empty states are clear
- Data loads correctly
- Quick actions navigate correctly
- Dashboard does not crash when data is missing
- Loading states display properly

### Common Mistake

Only testing the dashboard with data and forgetting the empty state.

---

## Step 21: Test Portfolio Projects

After adding portfolio project storage, test CRUD behavior.

### What to Test

Check that users can:

- Create a project
- View projects
- Edit a project
- Delete a project

### Error Tests

Try:

- Empty project title
- Empty description
- Invalid GitHub URL
- Invalid live demo URL
- Very long description
- Accessing another user’s project
- Deleting a project twice

### Pass Condition

- Projects save correctly
- Validation works
- Users only access their own projects
- Invalid URLs are rejected or handled
- Deleted projects no longer appear

### Common Mistake

Not validating project links.

---

# Phase 10: Full-System Testing

## Step 22: Test the Complete User Flow

After the main features are built, test the whole app from start to finish.

### What to Test

Create a brand-new account and complete this flow:

1. Register
2. Log in
3. Upload resume
4. Add job description
5. Generate match report
6. Generate cover letter
7. View dashboard
8. Log out
9. Log back in
10. Confirm saved data is still there

### Error Tests

Try the same flow with:

- Slow internet
- Bad resume file
- Empty job description
- AI API failure
- Page refresh during loading
- Multiple browser tabs
- Mobile screen size

### Pass Condition

The full system works without manual database fixes.

### Common Mistake

Testing features individually but not testing the complete user journey.

---

## Step 23: Test Error Handling

Check that the app handles failures professionally.

### What to Test

Simulate:

- Invalid login
- Missing file
- Invalid file type
- Empty forms
- Server error
- Database error
- AI API error
- Unauthorized access
- Network failure

### Pass Condition

Every error should show:

- A clear message
- No app crash
- No exposed sensitive details
- A way for the user to try again

### Common Mistake

Showing raw backend error messages to the user.

---

## Step 24: Test UI Polish and Responsiveness

Before deployment, test the visual quality.

### What to Test

Check the app on:

- Desktop
- Laptop
- Tablet size
- Mobile size

Check UI elements:

- Buttons
- Forms
- Cards
- Tables
- Modals
- Navigation
- Loading states
- Empty states
- Error states

### Pass Condition

- UI is readable
- Spacing is consistent
- Mobile layout works
- No text overlaps
- Long AI responses display properly
- Buttons are easy to click

### Common Mistake

Only designing for desktop.

---

# Phase 11: Deployment Tests

## Step 25: Test Frontend Deployment

After deploying Next.js to Vercel, test the live frontend.

### What to Test

Check:

- Homepage loads
- Login page loads
- Dashboard route works
- Environment variables are correct
- Frontend can reach backend API
- Refreshing protected routes works

### Error Tests

Try:

- Wrong backend API URL
- Missing environment variable
- Opening dashboard while logged out
- Refreshing a dynamic route
- Testing from another browser

### Pass Condition

- Live frontend behaves like local frontend
- API calls use the deployed backend
- No localhost URLs remain in production

### Common Mistake

Forgetting to update `NEXT_PUBLIC_API_URL`.

---

## Step 26: Test Backend Deployment

After deploying Laravel, test the live backend.

### What to Test

Check:

- API is reachable
- Migrations have run
- Database connection works
- Gemini API key is configured
- CORS allows frontend requests
- File uploads work
- Logs are available

### Error Tests

Try:

- Missing `APP_KEY`
- Missing `GEMINI_API_KEY`
- Wrong database credentials
- Frontend blocked by CORS
- Large file upload
- AI request from production

### Pass Condition

- Production API works
- Frontend can authenticate with backend
- AI features work in production
- Errors are logged safely

### Common Mistake

Production works locally but fails online because environment variables are missing.

---

## Step 27: Test the Deployed Full App

After both frontend and backend are deployed, test the full live app.

### What to Test

On the live URL:

1. Register a new user
2. Upload a resume
3. Add a job description
4. Generate a match report
5. Generate a cover letter
6. Refresh the page
7. Log out
8. Log back in

### Error Tests

Try:

- Bad login
- Invalid file
- AI generation failure
- Mobile browser
- Different browser
- Slow connection

### Pass Condition

The deployed app works without using local services.

### Common Mistake

Assuming deployment works because the homepage loads.

---

# Phase 12: Portfolio Preparation Tests

## Step 28: Test the README

Before sharing your GitHub repo, check the README quality.

### What to Test

Your README should explain:

- What the project does
- Problem it solves
- Tech stack
- Features
- Screenshots
- Setup instructions
- Environment variables
- How to run frontend
- How to run backend
- Future improvements

### Pass Condition

Someone else should understand and run the project from your README.

### Common Mistake

Writing a README only after forgetting how the project works.

---

## Step 29: Test the Demo Video Flow

Before recording, rehearse the demo.

### What to Test

Your demo should show:

- Login
- Resume upload
- Job description input
- Match report
- Cover letter
- Dashboard

### Pass Condition

The demo should be clear in 2 to 4 minutes.

### Common Mistake

Recording a demo before preparing good sample data.

---

## Step 30: Test the Resume Project Description

Before adding the project to your CV, check if the description is strong and honest.

### What to Test

Your resume bullet should mention:

- Full-stack development
- Next.js
- Laravel
- PostgreSQL
- Gemini API
- Resume analysis
- Job matching
- Cover letter generation

### Example

```text
Built an AI-powered job application assistant using Next.js, React, TypeScript, Laravel, PostgreSQL, Supabase, and Gemini Flash API, enabling users to upload resumes, analyze job descriptions, generate match reports, identify missing skills, and create tailored cover letters.
```

### Pass Condition

The project description should be accurate, specific, and recruiter-friendly.

### Common Mistake

Using vague wording like “made an AI app”.

---

# Manual Testing Checklist

Use this quick checklist before every major commit.

```text
[ ] App starts locally
[ ] Backend starts locally
[ ] Frontend starts locally
[ ] Database connection works
[ ] User can register
[ ] User can log in
[ ] User can log out
[ ] Protected routes are protected
[ ] Resume upload works
[ ] Invalid files are rejected
[ ] Job description can be saved
[ ] Empty forms show errors
[ ] Gemini API works
[ ] AI failure is handled
[ ] Match report is generated
[ ] Cover letter is generated
[ ] Dashboard loads correctly
[ ] User cannot access another user’s data
[ ] Mobile layout works
[ ] No API keys are exposed
[ ] No localhost URLs are used in production
```

---

# Suggested Automated Tests

You do not need to automate everything at first, but these tests are useful.

## Laravel Backend Tests

Use Laravel Feature Tests for:

```text
Authentication
Resume upload
Job description creation
Match report generation
Cover letter generation
Authorization
Validation errors
```

Example backend test categories:

```text
AuthTest
ResumeTest
JobDescriptionTest
MatchReportTest
CoverLetterTest
PortfolioProjectTest
```

## Frontend Tests

Use basic frontend tests for:

```text
Login form
Register form
Resume upload form
Job description form
Dashboard rendering
Match report rendering
```

## API Tests

Use Postman or Insomnia collections for:

```text
Register
Login
Get user
Upload resume
Create job
Generate match
Generate cover letter
Logout
```

---

# Security Testing Checklist

Before deployment, confirm:

```text
[ ] Gemini API key is only in Laravel backend
[ ] No API keys are stored in frontend code
[ ] Users cannot access other users’ resumes
[ ] Users cannot access other users’ jobs
[ ] Users cannot access other users’ reports
[ ] File uploads are validated
[ ] File size is limited
[ ] Passwords are hashed
[ ] CORS is configured correctly
[ ] Error messages do not expose secrets
[ ] Production debug mode is off
```

In Laravel production:

```env
APP_DEBUG=false
```

---

# AI-Specific Testing Checklist

Because this app depends on AI, test these carefully.

```text
[ ] AI returns valid JSON
[ ] Invalid JSON is handled
[ ] Missing AI fields are handled
[ ] AI timeout is handled
[ ] AI rate limit is handled
[ ] AI does not invent fake user experience
[ ] Match score is between 0 and 100
[ ] Cover letter uses only resume-based facts
[ ] Resume analysis is saved to avoid repeated API calls
[ ] Job analysis is saved to avoid repeated API calls
```

---

# Final Testing Rule

Do not move to the next phase until the current phase works.

Follow this rule:

```text
Build one feature.
Test the happy path.
Test the error cases.
Fix the bugs.
Then move on.
```

This will help you avoid building a large broken project that becomes hard to debug later.
