# Coding Agent Guidelines

This file provides guidance to code agents when working with code in this repository.

## Project Overview

(... Your project overview here ...)


## Core Principles

1. **Understand Before Acting**  
   - Always analyze the full context of existing code and requirements before implementing changes. 
   - Always check readme files first for overview
   - Avoid making assumptions—if unclear, check related files, docs, and comments.

2. **Simplicity & Readability**  
   - Favor clear, readable, and maintainable solutions over clever or overly complex implementations.  
   - Avoid deeply nested code, long functions, or unnecessary abstractions.

3. **Best Practices**  
   - Follow software engineering best practices: code readability, modularity, security, and maintainability.  
   - Adhere to the best practices specific to the programming language in use.
   - Keep functions and modules focused and concise.  
   - Do not overengineer.

4. **Documentation & Communication**  
   - Document every new function, module, and significant change.  
   - Keep README, project docs, and this file up to date.
   - Ensure the "Project Overview" section in documentation is complete and current.
   - Do not ask for images, screenshots, or other media when requesting clarification.
   
## Coding Guidelines
- If the task is a documentation-only task, do not implement any code.
- Always follow the project’s linter rules. The code must pass linting at all times.  
- Use the latest stable version of any external library.  
- Commit dependency lock files (e.g., `package-lock.json`, `poetry.lock`).  
- Avoid unnecessary refactorings.  
- Security should always be a consideration: validate inputs, handle errors gracefully, and avoid vulnerabilities.
- Maintain consistent coding style with the existing project.  

**Command Execution**:  
- Avoid chaining commands with `&&` unless necessary.  
- Ensure commands are safe and reproducible locally.

**Version Control**:  
- Repository is hosted on a version control platform; maintain CI/CD configuration (e.g., .gitlab-ci.yml, .github/workflows/*, or equivalent).
- Do not commit build artifacts (e.g., dist/, build/, target/).
- Do not commit dependency directories (e.g., node_modules/, vendor/).
- Do not commit cache or tooling metadata directories (e.g., .npm/).
- These are ephemeral files and should be excluded via .gitignore.
- Always update `.gitignore` when adding new tools or dependencies to prevent unwanted files.

### Testing

When writing tests, follow these specific guidelines:

- Do not try to test files that are not code.
- Make sure to write unit tests for any component, and higher-level tests when
  it makes sense.
- When trying to fix broken tests, always prefer to adapt the tests to the
  expected behavior rather than adapting the code to make the tests happy.
