#!groovy

pipeline {
  agent any

  stages {
    stage("Build and up") {
      steps {
        sh "docker build -t graph-front:latest ."
        sh "docker run --name graph-front-app -d -p 8080:8080 graph-front"
      }
    }
  }
}


