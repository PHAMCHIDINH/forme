# Personal Digital Hub MVP 1 PRD

## 1. Overview

Personal Digital Hub is a web application designed to become a unified private
workspace for a single individual. The long-term product vision is to centralize
personal tools, information, and workflows into one integrated platform,
including notes, tasks, files, calendar, search, and AI-assisted features.

MVP 1 does not attempt to deliver the entire product vision. It focuses on the
minimum set of capabilities required to establish the product foundation:

- private access through authentication
- a reusable dashboard shell for future internal tools
- a public-facing portfolio page
- one proof-of-concept productivity tool backed by a database
- a production deployment path with CI/CD

## 2. Product Vision

The product aims to become a personal operating system on the web. It should let
the owner manage personal work, projects, information, and digital assets from a
single interface while maintaining a clear separation between public presence and
private workspace.

In future phases, the platform can expand into:

- notes and personal knowledge management
- calendar and scheduling
- file and asset organization
- global search
- AI assistant and automation tools
- external integrations with third-party services

## 3. MVP 1 Goal

MVP 1 must prove that the platform can:

- serve a fast public website
- protect a private workspace for the owner
- persist data through a backend API and PostgreSQL
- support basic authenticated CRUD inside the dashboard
- deploy reliably to production through an automated pipeline

## 4. Target User

The target user for MVP 1 is the project owner.

This version is intentionally single-user:

- one owner account
- no team collaboration
- no multi-tenant requirements
- no admin roles beyond the owner

## 5. Problem Statement

The owner currently lacks a single platform that combines:

- a public place to present personal profile and projects
- a private authenticated workspace
- a growing collection of internal tools
- a consistent technical foundation for future modules

Without a structured foundation, each new tool would likely be built as an
isolated feature or side project, increasing maintenance cost and slowing future
expansion.

## 6. Success Metrics

MVP 1 is successful when:

- the public portfolio is reachable and loads correctly in production
- the owner can log in and access the private dashboard
- unauthorized users cannot access private API routes
- the owner can create, list, complete, and delete todo items
- todo data persists in PostgreSQL across sessions
- frontend deploys to Vercel from the main branch
- backend deploys to Railway from the main branch

## 7. Scope

### In Scope

#### 7.1 Core and Authentication

- username and password login for a single owner account
- JWT-based authentication
- secure token transport using `httpOnly` cookies
- protected private routes on both frontend and backend
- logout flow
- reusable dashboard shell with sidebar and topbar
- client-side routing between dashboard pages

#### 7.2 Public Portfolio

- landing page accessible without authentication
- static personal profile content
- static showcase for selected projects and skills
- links to GitHub and contact channels
- content stored in frontend source code as JSON or TypeScript data
- responsive layout for desktop and mobile

#### 7.3 Todo Tool

- authenticated task list screen inside the dashboard
- create a new task
- list existing tasks
- mark a task as completed or incomplete
- delete a task
- save all task changes to PostgreSQL through the backend API

#### 7.4 CI/CD and Deployment

- Dockerfile for frontend
- Dockerfile for backend
- deployment-ready environment configuration
- GitHub Actions workflow for build and deploy on push to `main`
- production deployment split:
  - frontend on Vercel
  - backend on Railway

### Out of Scope

- OAuth login with Google, GitHub, or other providers
- multi-user support
- admin CMS for portfolio content
- notes module
- file manager
- calendar module
- global search
- AI assistant
- notifications
- mobile application

## 8. User Personas

### Owner

The owner is a technical user using the platform for personal organization and
personal branding. They need:

- trusted private access
- a reliable production setup
- a simple first tool that validates the architecture
- a professional public portfolio page

### Public Visitor

The public visitor is someone accessing the owner's portfolio to learn about:

- identity and background
- skills and experience
- selected projects
- contact and GitHub links

## 9. User Stories

### Public Experience

- As a visitor, I want to access a public landing page so that I can learn about
  the owner without logging in.
- As a visitor, I want to see projects and contact links so that I can evaluate
  the owner's work and reach out.

### Owner Authentication

- As the owner, I want to sign in with username and password so that I can enter
  the private workspace.
- As the owner, I want my authenticated session to remain secure so that private
  tools are not exposed publicly.

### Owner Dashboard

- As the owner, I want a dashboard shell with navigation so that future tools can
  live inside a consistent workspace.
- As the owner, I want routing inside the dashboard to feel smooth so that using
  the application feels cohesive.

### Owner Todo Tool

- As the owner, I want to create tasks so that I can track short-term work.
- As the owner, I want to mark tasks done so that I can see progress clearly.
- As the owner, I want to delete tasks so that I can keep the list relevant.

## 10. Functional Requirements

### 10.1 Authentication

- The system must expose a login endpoint that validates owner credentials.
- The system must set an authentication cookie after successful login.
- The system must reject invalid login attempts with clear error responses.
- The system must provide a session-check mechanism for frontend bootstrapping.
- The system must provide a logout endpoint that clears the authentication cookie.
- The system must protect private API routes from unauthenticated access.

### 10.2 Frontend Routing and Layout

- The system must expose a public route for the portfolio page.
- The system must expose a login route for owner authentication.
- The system must expose protected dashboard routes.
- The dashboard layout must include a sidebar and topbar.
- Dashboard child routes must render without a full page reload.

### 10.3 Portfolio

- The portfolio page must render from static source-controlled content.
- The portfolio page must show owner bio, skills, project highlights, GitHub, and
  contact links.
- The portfolio page must not require backend content APIs in MVP 1.

### 10.4 Todo Module

- The system must expose APIs to list, create, update, and delete todo items.
- Todo records must be associated with the owner account.
- The frontend must display API-backed todo data inside the dashboard.
- Toggling completion must update the backend and persist in PostgreSQL.

### 10.5 Deployment

- Frontend must be deployable to Vercel.
- Backend must be deployable to Railway.
- CI/CD must build and validate both applications on push to `main`.

## 11. Non-Functional Requirements

- Frontend must use React and TypeScript.
- Backend must use Golang.
- Database must use PostgreSQL.
- Frontend and backend must remain separate deployable applications.
- Backend and frontend codebases must be organized as modular monoliths.
- Landing page should prioritize fast initial load.
- Private APIs must enforce authentication consistently.
- Environment-specific configuration must not be hardcoded in application logic.
- The architecture must remain extensible for future modules.

## 12. Assumptions

- MVP 1 serves one owner account only.
- Owner credentials will be provisioned through environment variables or seed
  data rather than through a registration flow.
- Portfolio content changes will be made through source code edits.
- Vercel will host the frontend and Railway will host the backend.
- PostgreSQL will be provisioned for the backend in Railway or an external
  compatible environment.

## 13. Risks

- Cross-origin cookie authentication between Vercel and Railway may require
  careful handling of `SameSite`, `Secure`, and CORS settings.
- Single-user assumptions may lead to shortcuts that make later multi-user
  expansion harder if boundaries are not kept clean.
- Static portfolio content accelerates MVP delivery but delays content editing
  capabilities until a later phase.

## 14. Release Criteria

MVP 1 is ready for release when:

- production frontend and backend deployments are live
- owner login works in production
- dashboard routes are protected
- todo CRUD works in production against PostgreSQL
- logout clears the session correctly
- portfolio page is publicly accessible and complete
- deployment steps are reproducible through CI/CD
