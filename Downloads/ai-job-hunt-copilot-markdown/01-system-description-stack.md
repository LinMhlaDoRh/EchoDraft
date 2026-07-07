# AI Job-Hunt Copilot

## System Description

**AI Job-Hunt Copilot** is an AI-powered full-stack web application that helps job seekers tailor their resumes, cover letters, and portfolio presentation for specific job opportunities.

The system allows a user to upload their resume, add portfolio projects, paste a job description, and receive an AI-generated match report. The report shows how well the user fits the role, which skills are missing, which resume sections should be improved, and how to rewrite resume bullet points for better alignment with the job description.

The application is designed as a practical, recruiter-facing software engineering portfolio project. It demonstrates modern frontend development, backend API design, database management, AI integration, file processing, authentication, and intelligent automation.

---

## Problem It Solves

Many students and junior developers struggle to tailor their resumes and applications for each job posting. They often use the same generic CV for every role, which lowers their chances of passing recruiter screening or Applicant Tracking Systems.

This system solves that problem by helping users:

- Understand how well their resume matches a specific job description
- Identify missing technical and soft skills
- Improve weak resume bullet points
- Generate a tailored cover letter
- Highlight the most relevant portfolio projects
- Save previous job matches and application history
- Make better decisions about which jobs to apply for

Instead of acting as a simple chatbot, the system works like a structured job application assistant.

---

## Target Users

The main users are:

- Final-year computer science students
- Junior software developers
- Bootcamp graduates
- Internship applicants
- Career switchers entering tech
- Developers building their first professional portfolio

---

## Core Features

### 1. User Authentication

Users can create an account, log in, and manage their own resumes, job descriptions, and AI-generated reports.

### 2. Resume Upload

Users can upload a resume file, such as PDF or DOCX. The backend extracts the text and stores the parsed resume content in the database.

### 3. Job Description Input

Users can paste a job description into the dashboard. The system stores the job title, company name, required skills, responsibilities, and raw description text.

### 4. AI Resume Analysis

The AI analyzes the uploaded resume and extracts:

- Technical skills
- Soft skills
- Work experience
- Education
- Projects
- Certifications
- Weak or generic bullet points
- Missing information

### 5. AI Job Description Analysis

The AI analyzes the job description and extracts:

- Required skills
- Preferred skills
- Main responsibilities
- Seniority level
- Keywords
- Tools and technologies mentioned
- Soft skills expected from the candidate

### 6. Match Score Report

The system compares the resume against the job description and generates a match report that includes:

- Overall match percentage
- Matching skills
- Missing skills
- Relevant experience
- Weak areas
- Recommended improvements
- Suggested learning topics

### 7. Resume Bullet Rewriter

The user can select weak resume bullet points and generate improved versions that are more specific, measurable, and aligned with the selected job.

### 8. Cover Letter Generator

The system generates a tailored cover letter based on:

- The user’s resume
- The job description
- The company name
- The user’s most relevant skills and projects

### 9. Portfolio Project Matching

Users can add portfolio projects to their profile. The system recommends which projects are most relevant to a specific job description.

### 10. Application History Dashboard

Users can view previous job matches, generated reports, and saved job descriptions in a dashboard.

---

## Technology Stack

## Frontend

### Next.js

The frontend will be built with **Next.js**, a React-based framework used for building modern web applications.

Next.js will handle:

- Dashboard pages
- Resume upload UI
- Job description forms
- Match report views
- Cover letter preview
- Authentication screens
- API communication with Laravel

### React

React will be used to build reusable UI components such as:

- Upload cards
- Match score widgets
- Skill badges
- Report sections
- Dashboard tables
- Form inputs
- Modal windows

### TypeScript

TypeScript will be used to improve code quality and reduce errors by adding static typing to the frontend.

### Tailwind CSS

Tailwind CSS will be used for styling the application quickly and consistently.

### shadcn/ui

shadcn/ui will be used for clean, modern dashboard components such as:

- Buttons
- Cards
- Dialogs
- Tabs
- Tables
- Forms
- Dropdown menus

### TanStack Query

TanStack Query will manage API calls between the Next.js frontend and Laravel backend.

It will be used for:

- Fetching resumes
- Fetching job descriptions
- Loading match reports
- Handling loading states
- Caching API responses
- Updating UI after mutations

---

## Backend

### Laravel

The backend will be built using **Laravel**, a PHP framework for building professional web applications and APIs.

Laravel will handle:

- REST API endpoints
- User authentication
- Resume upload processing
- File validation
- Database models
- Business logic
- AI API calls
- Match report generation
- Cover letter generation
- Authorization
- Background jobs

### Laravel Sanctum

Laravel Sanctum will be used for API authentication between the Next.js frontend and Laravel backend.

### Laravel Queues

Laravel Queues can be used to process longer AI tasks in the background, such as:

- Resume analysis
- Job description analysis
- Match report generation
- Cover letter generation

This prevents the user interface from freezing while waiting for AI responses.

### Laravel Form Requests

Form Requests will be used to validate incoming data, such as:

- Resume uploads
- Job description submissions
- User profile updates
- Portfolio project forms

### Laravel API Resources

API Resources will be used to return clean and consistent JSON responses to the frontend.

---

## Database

### Supabase PostgreSQL

The application will use **Supabase PostgreSQL** as the hosted database.

PostgreSQL will store:

- Users
- Resumes
- Resume sections
- Job descriptions
- Match reports
- Generated cover letters
- Portfolio projects
- Skills
- Application history

Supabase is a good choice because it provides a free tier, PostgreSQL hosting, storage, authentication options, and support for pgvector.

---

## Vector Search

### Supabase pgvector

The system can use **pgvector** to store vector embeddings for resume sections, job descriptions, and portfolio projects.

This allows the system to perform semantic search, meaning it can compare meaning instead of only matching exact keywords.

For example, if a job description asks for:

> Experience building REST APIs

The system could identify similar resume content such as:

> Developed backend endpoints for a student management platform using PHP and MySQL

Even though the wording is different, vector search helps the system understand that the experience is relevant.

---

## Production AI API

### Gemini Flash

The production application will use **Gemini Flash** as the single AI API.

Gemini Flash will be used for:

- Resume parsing
- Skill extraction
- Job description analysis
- Match report generation
- Resume bullet rewriting
- Cover letter generation
- Portfolio project recommendations

The system will only call Gemini Flash in production to keep costs low and avoid depending on multiple expensive AI APIs.

---

## Deployment Stack

### Frontend Deployment

The Next.js frontend can be deployed on:

- Vercel free tier

### Backend Deployment

The Laravel API can be deployed on:

- Render
- Railway
- Fly.io
- A low-cost VPS

### Database Hosting

The PostgreSQL database can be hosted on:

- Supabase free tier

### File Storage

Resume files can be stored using:

- Supabase Storage

### AI API

The AI features will be powered by:

- Gemini Flash API

---

## High-Level System Architecture

```text
User
 |
 v
Next.js Frontend Dashboard
 |
 v
Laravel REST API
 |
 v
Supabase PostgreSQL Database
 |
 v
Gemini Flash API
```

---

## Example User Flow

1. The user creates an account.
2. The user uploads a resume.
3. The Laravel backend extracts text from the resume.
4. The backend sends the resume text to Gemini Flash for analysis.
5. Gemini returns structured resume data.
6. The user pastes a job description.
7. The backend sends the job description to Gemini Flash for analysis.
8. The system compares the resume with the job requirements.
9. The user receives a match report.
10. The user generates improved resume bullets and a tailored cover letter.
11. The user saves the report in their dashboard.

---

## Suggested Database Tables

### users

Stores user account information.

Example fields:

- id
- name
- email
- password
- created_at
- updated_at

### resumes

Stores uploaded resumes.

Example fields:

- id
- user_id
- file_name
- file_path
- raw_text
- ai_summary
- created_at
- updated_at

### resume_sections

Stores structured resume sections extracted by AI.

Example fields:

- id
- resume_id
- section_type
- content
- embedding
- created_at
- updated_at

### job_descriptions

Stores job descriptions added by users.

Example fields:

- id
- user_id
- company_name
- job_title
- raw_description
- extracted_skills
- extracted_responsibilities
- created_at
- updated_at

### job_matches

Stores AI-generated match reports.

Example fields:

- id
- user_id
- resume_id
- job_description_id
- match_score
- matching_skills
- missing_skills
- recommendations
- created_at
- updated_at

### cover_letters

Stores generated cover letters.

Example fields:

- id
- user_id
- job_match_id
- content
- created_at
- updated_at

### portfolio_projects

Stores user portfolio projects.

Example fields:

- id
- user_id
- title
- description
- technologies
- project_url
- github_url
- embedding
- created_at
- updated_at

---

## Suggested API Endpoints

### Authentication

```text
POST /api/register
POST /api/login
POST /api/logout
GET /api/user
```

### Resumes

```text
POST /api/resumes
GET /api/resumes
GET /api/resumes/{id}
DELETE /api/resumes/{id}
```

### Job Descriptions

```text
POST /api/jobs
GET /api/jobs
GET /api/jobs/{id}
DELETE /api/jobs/{id}
```

### Match Reports

```text
POST /api/jobs/{id}/match
GET /api/matches
GET /api/matches/{id}
```

### Cover Letters

```text
POST /api/matches/{id}/cover-letter
GET /api/cover-letters/{id}
```

### Resume Improvements

```text
POST /api/matches/{id}/rewrite-bullets
```

### Portfolio Projects

```text
POST /api/projects
GET /api/projects
GET /api/projects/{id}
PUT /api/projects/{id}
DELETE /api/projects/{id}
```

---

## AI Prompting Strategy

The backend should request structured JSON responses from Gemini Flash instead of plain text.

Example resume analysis response:

```json
{
  "summary": "Final-year software engineering student with backend and database experience.",
  "technical_skills": ["PHP", "JavaScript", "MySQL", "React"],
  "soft_skills": ["problem-solving", "communication"],
  "projects": [
    {
      "name": "Student Management System",
      "technologies": ["PHP", "MySQL"],
      "description": "Built a CRUD-based system for managing student records."
    }
  ],
  "weak_bullets": [
    "Worked on database project"
  ],
  "improvement_suggestions": [
    "Make resume bullets more specific and measurable."
  ]
}
```

Example job match response:

```json
{
  "match_score": 78,
  "matching_skills": ["PHP", "JavaScript", "Database Design"],
  "missing_skills": ["Laravel", "TypeScript", "REST API Testing"],
  "summary": "The candidate is a good fit for a junior full-stack role but should improve Laravel and TypeScript experience.",
  "recommendations": [
    "Add a Laravel API project to the portfolio.",
    "Rewrite PHP experience to mention REST API development.",
    "Highlight database design experience more clearly."
  ]
}
```

---

## MVP Scope

The first version should focus on the most important features.

### MVP Features

- User registration and login
- Resume upload
- Resume text extraction
- Job description input
- AI resume analysis
- AI job description analysis
- Match score report
- Missing skills list
- Basic cover letter generation
- Dashboard showing saved reports

### Not Needed in MVP

These can be added later:

- Payment system
- Team accounts
- Browser extension
- Email automation
- Advanced analytics
- Multiple resume versions
- Full ATS simulation
- Real-time collaboration

---

## Future Enhancements

After the MVP is complete, the system can be improved with:

- Semantic search using pgvector
- Resume version comparison
- Downloadable PDF cover letters
- Job application tracker
- Interview question generator
- GitHub profile analysis
- LinkedIn profile analysis
- Skill learning roadmap generator
- Admin dashboard
- Analytics for most common missing skills
- Background job processing with Laravel Queues

---

## Portfolio Value

This project is strong for a final-year computer science or software engineering student because it proves the ability to build a complete, useful, AI-powered software product.

It demonstrates:

- React frontend development
- Next.js application structure
- TypeScript usage
- Laravel API development
- PHP backend skills
- REST API design
- Authentication
- PostgreSQL database design
- File uploads
- AI API integration
- Prompt engineering
- Structured JSON AI outputs
- Dashboard UI development
- Full-stack deployment
- Practical software problem-solving

---

## Resume Description

A strong resume bullet for this project could be:

> Built an AI-powered job application assistant using Next.js, React, TypeScript, Laravel, PostgreSQL, Supabase, and Gemini Flash API, enabling users to upload resumes, analyze job descriptions, generate match reports, identify missing skills, and create tailored cover letters.

Another version:

> Developed a full-stack AI SaaS-style platform with a Next.js dashboard and Laravel REST API, integrating Gemini Flash for resume analysis, job matching, structured skill extraction, and personalized cover letter generation.

---

## Final Summary

AI Job-Hunt Copilot is a full-stack AI web application that helps students and junior developers improve their job applications. It uses a Next.js frontend, Laravel backend, Supabase PostgreSQL database, and Gemini Flash API to analyze resumes, compare them with job descriptions, generate match reports, and create tailored application materials.

The project is affordable to build, practical to use, and valuable as a portfolio piece because it demonstrates both modern web development and applied AI engineering.
