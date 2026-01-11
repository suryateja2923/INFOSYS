# Deployment guide

This document explains the provided GitHub Actions workflow and how to configure secrets and the target server.

Required GitHub repository secrets:
- `DOCKERHUB_USERNAME` – Docker Hub username
- `DOCKERHUB_TOKEN` – Docker Hub access token or password
- `DEPLOY_HOST` – server IP or hostname for SSH deploy
- `DEPLOY_USER` – SSH user on the server
- `DEPLOY_SSH_KEY` – private SSH key (PEM) for `DEPLOY_USER`
- `DEPLOY_SSH_PORT` – optional SSH port (default 22)
- `DEPLOY_TARGET_PATH` – remote path where `deploy-compose.yml` will be copied (e.g. `/home/ubuntu/app`)

Server prerequisites:
- Docker and Docker Compose installed (or Docker Compose v2 via `docker compose`).
- The `DEPLOY_USER` must be able to manage Docker (via group or sudo) and write to `DEPLOY_TARGET_PATH`.

How the workflow works:
1. On push to `main`, the workflow runs tests, builds frontend and backend, and pushes images to Docker Hub with a short SHA tag.
2. The workflow generates `deploy-compose.yml` referencing the pushed images and SCPs it to the remote server.
3. The workflow SSHs to the server and runs `docker compose pull` and `docker compose up -d` in the target path.

Notes and next steps:
- Update your remote server's `docker-compose.yml` or use the generated `deploy-compose.yml` as-is; adjust service ports, volumes, and environment variables as needed.
- If you prefer a cloud provider (ECS, Azure Web Apps, App Service), tell me which one and I will adapt the workflow.
- After adding secrets, trigger a test run by pushing a branch or using the Actions UI to re-run the workflow.
