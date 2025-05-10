# 🚀 Jenkins + Slack Bot CI/CD with Docker

Automate your deployments using **Jenkins**, and trigger them directly from **Slack** with a custom bot — all running seamlessly in **Docker containers**.

---

## 📋 Table of Contents

- [⚙️ Prerequisites](#-step-1-install-docker)
- [🐳 Run Jenkins with Docker](#-step-2-run-jenkins-with-docker)
- [🔐 Set Up Jenkins](#-step-3-set-up-jenkins)
- [🧱 Create a Jenkins Job](#-step-4-create-a-jenkins-job)
- [🤖 Build the Slack Bot](#-step-5-build-your-slack-bot)
- [📡 Run Everything](#-step-6-run-everything-with-one-command)
- [✅ Create Slack App](#-step-7-create-slack-app)
- [📝 Project Report](#-project-report)

---
## ScreenShots 
![Screenshot 2025-05-10 154815](https://github.com/user-attachments/assets/2998cf5e-d1b3-44dc-93ab-e4996dee06d2)
![Screenshot 2025-05-10 154824](https://github.com/user-attachments/assets/b7024aa6-ca49-45e0-920a-51d961a17408)
![Screenshot 2025-05-10 154842](https://github.com/user-attachments/assets/c6373cf0-b028-40c4-9aec-3940c80cd264)
![Screenshot 2025-05-10 154717](https://github.com/user-attachments/assets/65518f87-5d1f-4c18-9ada-31f295f1adda)
![Screenshot 2025-05-10 154657](https://github.com/user-attachments/assets/9391bc15-9be6-452e-92d8-83e5ab52cca7)
![Screenshot 2025-05-10 154624](https://github.com/user-attachments/assets/eb364ac7-cb23-4170-ad31-c081e804c3f7)


📦 Step 1: Install Docker

- **Windows/Mac**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Use your package manager (`apt`, `dnf`, etc.)

✅ Verify installation:

```bash
docker --version
🐳 Step 2: Run Jenkins with Docker
① Create Docker network:

bash
Copy
Edit
docker network create jenkins
② Run Jenkins container:

bash
Copy
Edit
docker volume create jenkins_home

docker run -d --name jenkins \
  --network jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
📍 Jenkins will be available at: http://localhost:8080

🔐 Step 3: Set Up Jenkins
① Get Jenkins admin password:

bash
Copy
Edit
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
② Complete setup in the browser:

Open http://localhost:8080

Click Install suggested plugins

Create an admin user

Finish the setup process

🧱 Step 4: Create a Jenkins Job
① Create a new Pipeline job:

Jenkins Dashboard → New Item

Name: deploy-app

Type: Pipeline → OK

② Enable Remote Trigger:

Check ✅ "Trigger builds remotely"

Set Token: mytoken

③ Add Pipeline Script:

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
④ Trigger the job via:

bash
Copy
Edit
http://localhost:8080/job/deploy-app/build?token=mytoken
🤖 Step 5: Build Your Slack Bot
① Initialize Node.js project:

bash
Copy
Edit
mkdir slack-jenkins-bot && cd slack-jenkins-bot
npm init -y
npm install express body-parser axios dotenv
② Create .env.example:

env
Copy
Edit
PORT=3000
SLACK_VERIFICATION_TOKEN=your-slack-token
JENKINS_URL=http://jenkins:8080/job/deploy-app/build
JENKINS_TOKEN=mytoken
③ Create server.js:

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
④ Create Dockerfile:

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
⑤ Create docker-compose.yml:

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
① Copy .env.example to .env and fill in your values:

bash
Copy
Edit
cp .env.example .env
Update .env:

env
Copy
Edit
PORT=3000
SLACK_VERIFICATION_TOKEN=your-slack-verification-token
JENKINS_URL=http://jenkins:8080/job/deploy-app/build
JENKINS_TOKEN=mytoken
② Start services:

bash
Copy
Edit
docker-compose up --build
✅ Step 7: Create Slack App
① Go to https://api.slack.com/apps
② Create a new app → From Scratch
③ Add a Slash Command:

Command: /deploy-app

Request URL: http://<your-public-url>/slack/commands (Use ngrok for local testing)

④ Install the app to your Slack workspace
⑤ Copy Signing Secret → paste into .env as SLACK_VERIFICATION_TOKEN
