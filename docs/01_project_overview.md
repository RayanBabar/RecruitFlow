# 1. Project Overview

## 1.1 Introduction
The **Smart Job Portal & AI Resume Analyzer** is a 4-week final-year software engineering project. It is a dedicated recruitment web application designed to bridge the gap between employers and job seekers. 

The platform modernizes the traditional recruitment lifecycle by replacing manual resume screening and preliminary interviews with an intelligent, multi-agent AI microservice.

## 1.2 Core Differentiators
Unlike standard CRUD job portals, this platform features an independent AI microservice that handles two complex tasks:

1. **Automated Resume Parsing & Scoring:** Instantly reading uploaded applicant PDFs, extracting core competencies (skills, experience, education), and calculating a structured match percentage against specific job descriptions to eliminate human bias and reduce time-to-hire.
2. **Multi-Agent Mock Interviews:** Providing candidates with a dynamic, stateful interview practice session driven by a LangGraph AI orchestrator. The AI assumes the roles of both an HR Agent (for behavioral questions) and a Technical Agent (for domain-specific questions), contextualized entirely by the parsed resume and target job.

## 1.3 User Roles & Capabilities

### Employers
* Create, read, update, and delete (CRUD) job postings.
* View a dedicated dashboard of applicants.
* Filter and sort applicants instantly based on the AI-generated Match Score and feedback justifications.

### Job Seekers
* Register and build a persistent profile.
* Upload standard text-readable PDF resumes.
* Browse active job listings and apply.
* Track application statuses (e.g., Applied, Shortlisted, Rejected).
* Initiate dynamic Mock Interview sessions to practice for specific job postings.

### Administrators
* Maintain global oversight.
* Manage user accounts (Job Seekers and Employers).
* Monitor platform data and system health.

## 1.4 Out of Scope
To ensure a successful 4-week delivery, the following features are explicitly excluded from the project scope:
* Integrated video conferencing systems.
* Complex payment gateways for premium job postings.
* Internal chat messaging modules between employers and candidates.
* Complex OCR for non-standard image-based resumes (assumes text-readable PDFs).
