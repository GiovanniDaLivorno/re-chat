# ReChat CI/CD Workflow

This workflow has three main stages:

## Lint & Test

- Runs for both React frontend and FastAPI backend.
- Checks code quality using ESLint fort frontend and pytest for backend.
- Runs on every push to main and on manual triggers (workflow_dispatch).
2. Build & Push Docker Images
- Builds Docker images for frontend and backend separately.
- Pushes images to the configured Docker registry (e.g., Docker Hub).
- Supports caching and multi-platform images (amd64 and arm64).
3. Deployment (Human-in-the-Loop)
- Pauses until one of the configured reviewers approves the deployment.
- Only approved personnel can deploy to the production environment.
- Deployment commands pull Docker images and start the services.

## Triggering the Workflow
Manual Trigger
Go to the Actions tab in GitHub.
Select the workflow CI/CD Pipeline.
Click Run workflow.
Select the branch (usually main) and confirm.
Automatic Trigger
Pushes to the main branch trigger lint, tests, and Docker image builds automatically.
Deployment still requires manual approval.

## Approving Deployment
When the workflow reaches the Deploy stage, it will pause for approval.
A notification appears in GitHub for the configured reviewers.
A reviewer clicks Approve to continue deployment.
Deployment commands execute automatically after approval.

⚠️ Only reviewers listed in the production environment can approve deployments.

## Accessing Services

- Frontend: ```http://<server-ip>:3000```
- Backend: API endpoints as configured in Docker Compose.

## Common Commands for Operations

If you need to manually inspect or troubleshoot:
- Tail logs of all services
  ```
  docker compose logs -f
  ```
- Stop all services
  ```
  docker compose down
  ```
- Restart services
  ```
  docker compose restart
  ```

- Clean up build artifacts and orphaned containers
  ```
  make clean
  ```