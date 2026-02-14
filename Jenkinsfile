#!groovy

pipeline {
  agent any

  stages {
    stage("Build") {
      steps {
        sh "docker compose -f docker-compose.yml build"
      }
    }
    stage("Up") {
      steps {
        sh "docker compose -f docker-compose.yml up --build -d --remove-orphans"
      }
    }
  }
}


