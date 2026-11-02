# ClinicFlow — Clinic Appointment Portal

A responsive clinic appointment scheduling demo that gives the Jenkins practicals a real application to build, scan, deploy and release.

## Demo features
- Browse and search four specialists across Cardiology, Dermatology, Pediatrics and General Medicine.
- Filter by specialty and choose a doctor.
- Select a future date and available time slot.
- Book an appointment with basic name/mobile validation.
- Prevent double-booking for a doctor/date/slot within this browser.
- Review and cancel upcoming appointments.
- Persist demo bookings in browser localStorage.
- Read a small `release.json` file to show the currently built release label (standard, blue, green).

> **Important:** This is an educational UI prototype, not a production healthcare system. It has no authentication, server-side database, access controls or medical-record handling. Booking data stays in that browser's localStorage. Do not enter real patient or health information.

## Run locally

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

Build for production:

```bash
npm run build
```

## Docker

```bash
docker build -t clinicflow:1.0 .
docker run --rm -p 8085:80 clinicflow:1.0
```

Open http://localhost:8085.

Blue/Green image variants:

```bash
docker build --build-arg RELEASE=blue -t clinicflow-blue:1.0 .
docker build --build-arg RELEASE=green -t clinicflow-green:1.0 .
```

## Kubernetes manifests

The manifests assume Minikube and preloaded local images:

- Task 7 NodePort: 30083 (`k8s/task7-deployment.yaml`)
- Task 8 Blue-Green NodePort: 30084 (`k8s/task8-blue-deployment.yaml`, `k8s/task8-green-deployment.yaml`)
- Task 9 DevSecOps NodePort: 30085 (`k8s/task9-deployment.yaml`)

Load each image into Minikube before applying its manifest. All NodePort access also requires the EC2 security group to allow the relevant port from your IP; do not expose these demo ports to the whole internet unnecessarily.

## Jenkins pipeline templates

The `jenkins/` directory contains pipeline scripts that use `/opt/clinicflow` on the EC2 Jenkins host. Copy this project to that path and ensure Jenkins can read it and run Docker, kubectl, minikube and Trivy. Use the matching Jenkinsfile contents to update the three Jenkins jobs.

### Pipeline mapping

1. **Task 7 — CI/CD:** Build image → load into Minikube → apply deployment/service → verify rollout.
2. **Task 8 — Blue-Green:** Build Blue and Green image variants → deploy both → switch Service selector to Green.
3. **Task 9 — DevSecOps:** Build image → scan using Trivy → load scanned image → deploy and verify.

The three workflows deploy the same ClinicFlow application to separate Kubernetes workloads/services, so each assignment demonstrates a different delivery strategy.
