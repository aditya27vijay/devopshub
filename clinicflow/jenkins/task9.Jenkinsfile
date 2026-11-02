pipeline {
  agent any
  stages {
    stage('Build ClinicFlow Image') {
      steps { sh 'cd /opt/clinicflow && docker build -t clinicflow:1.0 .' }
    }
    stage('Trivy Vulnerability Scan') {
      steps { sh 'trivy image --scanners vuln --exit-code 0 clinicflow:1.0' }
    }
    stage('Load Image into Minikube') {
      steps { sh 'minikube image load clinicflow:1.0' }
    }
    stage('Deploy Scanned Image') {
      steps {
        sh '''
          cd /opt/clinicflow
          kubectl apply -f k8s/task9-deployment.yaml
          kubectl rollout status deployment/clinicflow-devsecops --timeout=120s
          kubectl get deployments,pods,services
        '''
      }
    }
  }
}
