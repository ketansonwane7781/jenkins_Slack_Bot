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
