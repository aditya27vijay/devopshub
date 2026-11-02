pipeline {
  agent any
  stages {
    stage('Build ClinicFlow Image') {
      steps { sh 'cd /opt/clinicflow && docker build -t clinicflow:1.0 .' }
    }
    stage('Load Image into Minikube') {
      steps { sh 'minikube image load clinicflow:1.0' }
    }
    stage('Deploy ClinicFlow') {
      steps {
        sh '''
          cd /opt/clinicflow
          kubectl apply -f k8s/task7-deployment.yaml
          kubectl rollout status deployment/clinicflow-task7 --timeout=120s
          kubectl get deployments,pods,services
        '''
      }
    }
  }
}
