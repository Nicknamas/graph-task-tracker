#!groovy

pipeline {
  agent any

  stages {
    stage("Build and Up") {
      steps {
        sh "docker compose up -d --build --remove-orphans"
      }
    }
  }
}


