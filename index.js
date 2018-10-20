const express = require('express')
const PORT = process.env.PORT || 5000
const inspect = require('util').inspect

express()
  .get('/', (req, res) => {
    process.stdout.write(inspect(req));
    res.send('pouet')
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
