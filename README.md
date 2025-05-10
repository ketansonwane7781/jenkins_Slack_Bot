# 🚀 Jenkins + Slack Bot CI/CD with Docker

Automate your deployments with **Jenkins** and control them with a simple Slack command using a **Node.js Slack bot** — all containerized with **Docker & Docker Compose**.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Install Docker](#-step-1-install-docker)
3. [Run Jenkins with Docker](#-step-2-run-jenkins-with-docker)
4. [Set Up Jenkins](#-step-3-set-up-jenkins)
5. [Create a Jenkins Job](#-step-4-create-a-jenkins-job)
6. [Build the Slack Bot](#-step-5-build-your-slack-bot)
7. [Run Everything](#-step-6-run-everything-with-one-command)
8. [Create Slack App](#-step-7-create-slack-app)

---

 📦 Step 1: Install Docker

- **Windows/Mac:** [Install Docker Desktop](https://www.docker.com/products/docker-desktop)  
- **Linux:** Use your package manager (`apt`, `dnf`, etc.)

Verify installation:

```bash
docker --version

🐳 Step 2: Run Jenkins with Docker
1️⃣ Create a Docker network:

bash
Copy
Edit
docker network create jenkins
2️⃣ Create Jenkins container:

bash
Copy
Edit
docker volume create jenkins_home

docker run -d --name jenkins \
  --network jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
➡️ Jenkins will be available at: http://localhost:8080

🔐 Step 3: Set Up Jenkins
1️⃣ Get the admin password:

bash
Copy
Edit
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
2️⃣ Open Jenkins in browser and:

Click “Install suggested plugins”

Create your admin user

Complete the setup

🧱 Step 4: Create a Jenkins Job
1️⃣ New Item → Name: deploy-app → Type: Pipeline

2️⃣ Enable remote trigger:

Check "Trigger builds remotely"

Set Token: mytoken

3️⃣ Pipeline script:

groovy
Copy
Edit
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'App deployed!'
      }
    }
  }
}
4️⃣ Trigger the job:

bash
Copy
Edit
http://localhost:8080/job/deploy-app/build?token=mytoken
🤖 Step 5: Build Your Slack Bot
1️⃣ Create project folder and install dependencies:

bash
Copy
Edit
mkdir slack-jenkins-bot && cd slack-jenkins-bot
npm init -y
npm install express body-parser axios dotenv
2️⃣ Create .env.example:

env
Copy
Edit
PORT=3000
SLACK_VERIFICATION_TOKEN=your-slack-token
JENKINS_URL=http://jenkins:8080/job/deploy-app/build
JENKINS_TOKEN=mytoken
3️⃣ server.js:

js
Copy
Edit
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/commands', async (req, res) => {
  const { token, text, user_name } = req.body;

  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    return res.status(403).send('Unauthorized request.');
  }

  if (text === 'deploy-app') {
    try {
      await axios.post(`${process.env.JENKINS_URL}?token=${process.env.JENKINS_TOKEN}`);
      res.send(`✅ Deployment triggered by ${user_name}`);
    } catch (error) {
      res.send(`❌ Failed: ${error.message}`);
    }
  } else {
    res.send(`🤖 Unknown command: \`${text}\``);
  }
});

app.listen(port, () => {
  console.log(`Slack bot running on port ${port}`);
});
4️⃣ Dockerfile:

Dockerfile
Copy
Edit
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
5️⃣ docker-compose.yml:

yaml
Copy
Edit
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    ports:
      - "8080:8080"
    volumes:
      - jenkins_home:/var/jenkins_home
    networks:
      - jenkins

  slack-bot:
    build: .
    container_name: slack-bot
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - jenkins
    networks:
      - jenkins

volumes:
  jenkins_home:

networks:
  jenkins:
📡 Step 6: Run Everything with One Command
1️⃣ Copy .env.example to .env and fill in your values:

env
Copy
Edit
PORT=3000
SLACK_VERIFICATION_TOKEN=your-slack-verification-token
JENKINS_URL=http://jenkins:8080/job/deploy-app/build
JENKINS_TOKEN=mytoken
2️⃣ Run:

bash
Copy
Edit
docker-compose up --build
✅ Step 7: Create Slack App
Go to: https://api.slack.com/apps

Create new app → From scratch

Add a Slash Command: /deploy-app

Request URL: http://<your-public-url>/slack/commands (use ngrok for localhost)

Install app to workspace

Copy your Signing Secret and use it as SLACK_VERIFICATION_TOKEN in .env

🌟 Done! Now You Can:
Deploy your app by typing /deploy-app in Slack 🚀

Jenkins will handle the build automatically

All containerized, no manual steps needed! 🐳

🙌 Contributing
Feel free to open issues or submit PRs to improve or extend functionality.
