# Implementation Prompt for Cursor AI

Use this prompt in Cursor to begin implementing Project Echo according to the Technical Design Document.

---

## Initial Setup Prompt

```
I'm ready to start building Project Echo, a social recommendation app. Please read the Technical Design Document located at `documents/Technical-Design-Document.md` and begin implementing Phase 1: Foundation & Infrastructure.

Here's how I want you to proceed:

1. **Read the Technical Design Document** - Review the entire document to understand:
   - System architecture (Section 1)
   - Technical requirements (Section 2)
   - Technology stack recommendations (Section 3)
   - Database schema (Section 4)
   - API specifications (Section 5)

2. **Start with Phase 1, Task 1.1** - Begin with "Initialize Backend Project Structure"
   - Follow the task breakdown exactly as specified
   - Create all files and directories as outlined
   - Use the technology stack specified in Section 3 (Node.js, TypeScript, Express.js, Prisma, PostgreSQL)

3. **Work Through Tasks Sequentially**:
   - Complete each task fully before moving to the next
   - Mark tasks as complete when done
   - If a task has dependencies, ensure prerequisites are met first
   - Write code following the patterns and architecture defined in the document

4. **For Each Task**:
   - Create the necessary files and directories
   - Implement the functionality as specified
   - Include proper error handling
   - Add input validation where specified
   - Write unit tests when mentioned in the task
   - Follow TypeScript best practices
   - Use the exact file paths and function names specified

5. **Ask for Clarification** if:
   - A task is unclear
   - You need to make a decision not specified in the document
   - You encounter a conflict between tasks

6. **Progress Reporting**:
   - After completing each task, summarize what was implemented
   - Before moving to the next task, confirm it's ready
   - If you encounter issues, explain them and propose solutions

Please start by reading the Technical Design Document and then begin with Phase 1, Task 1.1: Initialize Backend Project Structure.
```

---

## Alternative: Phase-by-Phase Prompt

If you prefer to work phase by phase, use this prompt:

```
I want to implement Phase [X] of Project Echo. Please:

1. Read the Technical Design Document at `documents/Technical-Design-Document.md`
2. Review Phase [X] requirements and all prerequisite phases
3. Work through each task in Phase [X] sequentially:
   - Task [X].1
   - Task [X].2
   - Task [X].3
   - etc.

For each task:
- Follow the exact specifications in the document
- Create files at the specified paths
- Implement functions with the specified names
- Include error handling and validation
- Write tests when specified
- Use the technology stack from Section 3

After completing all tasks in Phase [X], verify the milestone criteria are met before proceeding.

Start with Phase [X], Task [X].1.
```

---

## Specific Task Prompt

For working on a specific task:

```
I want to implement Phase [X], Task [X].[Y] from the Technical Design Document.

Please:
1. Read the task specification in `documents/Technical-Design-Document.md` Section 9.2, Phase [X]
2. Review any referenced sections (database schema, API specs, etc.)
3. Implement the task exactly as specified:
   - Create required files and directories
   - Implement functions with specified names
   - Follow the architecture patterns
   - Include error handling and validation
   - Write tests if mentioned
4. Verify the implementation matches the requirements
5. Report what was created/implemented

Start with Phase [X], Task [X].[Y]: [Task Name]
```

---

## Quick Start Commands

### For Phase 1 (Foundation):
```
Read `documents/Technical-Design-Document.md` and implement Phase 1: Foundation & Infrastructure. Start with Task 1.1 and work through all tasks sequentially. Use Node.js, TypeScript, Express.js, Prisma, and PostgreSQL as specified.
```

### For Backend Development:
```
I'm building the backend for Project Echo. Read the Technical Design Document and implement Phases 1-7 (all backend phases). Follow the task breakdown exactly, starting with Phase 1, Task 1.1.
```

### For Mobile Development (after backend):
```
The backend APIs are ready. Read the Technical Design Document and implement Phase 8 (iOS) or Phase 9 (Android). Follow the mobile app development tasks, integrating with the existing backend APIs.
```

---

## Tips for Using These Prompts

1. **Start Fresh**: Use the Initial Setup Prompt when beginning the project
2. **Phase-by-Phase**: Use the Phase-by-Phase Prompt when you want to focus on one phase
3. **Specific Tasks**: Use the Specific Task Prompt when you need to implement or fix a particular task
4. **Reference the Doc**: Always reference the Technical Design Document - it contains all the details
5. **Check Prerequisites**: Before starting a phase, ensure all prerequisites are met
6. **Verify Milestones**: After completing a phase, verify the milestone criteria are met

---

## Example: Starting Phase 1

Copy and paste this into Cursor:

```
I'm ready to start building Project Echo. Please read the Technical Design Document at `documents/Technical-Design-Document.md` and begin implementing Phase 1: Foundation & Infrastructure.

Start with Task 1.1: Initialize Backend Project Structure. Create the backend directory, set up the Node.js/TypeScript project structure, and configure the development environment as specified in the document.

Work through each task in Phase 1 sequentially, implementing:
- Task 1.1: Initialize Backend Project Structure
- Task 1.2: Set Up Database and ORM
- Task 1.3: Implement Database Schema - Core Tables
- Task 1.4: Set Up Express Server and Middleware
- Task 1.5: Implement User Registration Endpoint
- Task 1.6: Implement User Login Endpoint
- Task 1.7: Implement JWT Authentication Middleware
- Task 1.8: Set Up CI/CD Pipeline
- Task 1.9: Set Up Development Environment

For each task, follow the exact specifications, create files at the specified paths, and implement functionality as described. Include error handling, validation, and tests where specified.

After completing all Phase 1 tasks, verify the milestone: "Backend server running, users can register/login via API, JWT authentication working"
```

---

## Notes

- The Technical Design Document is the single source of truth
- All file paths, function names, and API endpoints are specified in the document
- Follow the technology stack recommendations (Section 3)
- Reference the database schema (Section 4) when creating migrations
- Follow the API specifications (Section 5) when implementing endpoints
- Write tests as specified in each task
- Ask questions if anything is unclear

