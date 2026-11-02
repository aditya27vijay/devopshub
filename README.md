# DevOpsHub

A unified dashboard for demonstrating three Jenkins-based DevOps workflows:

1. **Task 7 – CI/CD:** Docker build and Kubernetes deployment.
2. **Task 8 – Blue-Green:** Blue/Green deployment and service traffic selection.
3. **Task 9 – DevSecOps:** Trivy image vulnerability scan followed by Kubernetes deployment.

## Architecture

- React + Vite frontend (`client/`)
- Express API (`server/`)
- Jenkins REST API integration on the server only

The dashboard reads real job/build data from Jenkins and can trigger builds. Jenkins credentials are never sent to the browser.

## Configure

Create `server/.env` (see `.env.example`) and set:

- `JENKINS_URL`: base URL, e.g. `http://YOUR_EC2_PUBLIC_IP:8080`
- `JENKINS_USER`: Jenkins username
- `JENKINS_API_TOKEN`: Jenkins API token (not your password)
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`

Make sure Jenkins is reachable from the machine running this backend. If Jenkins is only reachable from your EC2 network, deploy the backend alongside Jenkins or use a private network/VPN. Do not expose Jenkins broadly just to make the dashboard work.

## Run locally

```bash
npm install
npm install --prefix server
npm install --prefix client
cp server/.env.example server/.env
npm run dev
```

Open http://localhost:5173.

## Jenkins jobs expected

- `Task7-CICD-Pipeline`
- `Task8-BlueGreen-Pipeline`
- `Task9-DevSecOps-Pipeline`

Set different names in `server/.env` if your Jenkins jobs differ.

## Notes

The UI distinguishes live Jenkins data from unavailable/offline data. It does not fabricate successful builds. Task 8's active colour and Task 9's vulnerability counts are shown only when Jenkins build output contains recognizable evidence; otherwise the dashboard links to the build console for verification.
