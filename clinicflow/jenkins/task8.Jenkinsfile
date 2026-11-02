pipeline {
  agent any
  stages {
    stage('Build Blue and Green Images') {
      steps {
        sh '''
          cd /opt/clinicflow
          docker build --build-arg RELEASE=blue -t clinicflow-blue:1.0 .
          docker build --build-arg RELEASE=green -t clinicflow-green:1.0 .
        '''
      }
    }
    stage('Load Images into Minikube') {
      steps { sh 'minikube image load clinicflow-blue:1.0 && minikube image load clinicflow-green:1.0' }
    }
    stage('Deploy Both Environments') {
      steps {
        sh '''
          cd /opt/clinicflow
          kubectl apply -f k8s/task8-blue-deployment.yaml
          kubectl apply -f k8s/task8-green-deployment.yaml
          kubectl rollout status deployment/clinicflow-blue --timeout=120s
          kubectl rollout status deployment/clinicflow-green --timeout=120s
        '''
      }
    }
    stage('Switch Traffic to Green') {
      steps {
        sh '''
          kubectl patch service clinicflow-bluegreen -p '{"spec":{"selector":{"app":"clinicflow-bluegreen","version":"green"}}}'
          kubectl get endpoints clinicflow-bluegreen
        '''
      }
    }
  }
}
