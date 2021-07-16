const express = require('express');
const bodyParser = require('body-parser');
const simple = require('./simple');

(async () => {
  const app = express();
  const port = 3000;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post('/person/:nitType/:nit', async (req, res) => {
    await simple.run();
    console.log({ reqParams: req.params, body: req.body });
    res.json({ reqParams: req.params, body: req.body });
  });

  app.listen(port, () => {
    console.log('Running Portfolio Debugging System (server side)...');
  });
})();
