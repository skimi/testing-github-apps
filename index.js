const express = require('express')
const request = require('request-promise-native')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const randomTextFaces = require('random-text-faces');

require('dotenv').config();

const generateToken = () => {
  const tokenInfo = {
    iat: Math.floor(+new Date() / 1000),
    exp: Math.floor(+new Date() / 1000) + 10,
    iss: parseInt(process.env['GITHUB_APP_IDENTIFIER'], 10),
  };

  // console.log(tokenInfo);

  return jwt.sign(
    tokenInfo,
    process.env['GITHUB_PRIVATE_KEY'],
    {
      algorithm: 'RS256',
    }
  )
}

const handleChecks = async (req) => {
  const {
    check_suite: {
      head_sha,
    },
    repository: {
      full_name,
    },
    installation: {
      id: installation_id,
    },
  } = req.body

  const installationToken = await request({
    method: 'post',
    url: `https://api.github.com/app/installations/${installation_id}/access_tokens`,
    json: true,
    headers: {
      Accept: 'application/vnd.github.machine-man-preview+json',
      Authorization: `Bearer ${generateToken()}`,
      'User-Agent': 'Skimi tests things App',
    },
  })


  // console.log(installationToken)

  const response = await request({
    method: 'post',
    url: `https://api.github.com/repos/${full_name}/check-runs`,
    headers: {
      Accept: 'application/vnd.github.antiope-preview+json',
      Authorization: `token ${installationToken.token}`,
      'User-Agent': 'Skimi tests things App',
    },
    json: true,
    body: {
      name: 'Eslint',
      head_sha,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      output: {
        title: 'Coucou',
        summary: 'I\'m supposed to run ESlint',
        text: `
## Markdown
Super!
> yeeaah
\`\`\`
${randomTextFaces.get()}
\`\`\`
`
      }
    }
  })

  // console.log(response);
}

const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Skimit testing Github Apps')
})

app.post('/', (req, res) => {
  // console.log(req.headers['x-github-event']);
  // console.log(req.body.action);

  if (req.headers['x-github-event'] === 'check_suite') {
    if (req.body.action === 'rerequested' || req.body.action === 'requested') {
      handleChecks(req);
    }
  }

  res.send('ok')
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
