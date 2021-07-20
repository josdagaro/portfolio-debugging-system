const express = require('express');
const bodyParser = require('body-parser');
const simple = require('./simple');

(async () => {
  const app = express();
  const port = 3000;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post('/person/:nitType/:nit', async (req, res) => {
    let simpleResponse = null;

    try {
      simpleResponse = await simple.run(req.params, req.body);

      if (!simpleResponse.hasOwnProperty('status') || !simpleResponse.hasOwnProperty('message')) {
        throw simpleResponse;
      }

      console.log('[DEBUG]: Done');

      res.json({
        simple: simpleResponse,
      });
    } catch (exception) {
      console.log('[DEBUG]: Something crashes. Check the response');

      if (exception.hasOwnProperty('status') && exception.hasOwnProperty('message')) {
        res.status(exception.status).json({ err: exception.message });
      } else {
        res.status(500).json({ err: exception });
      }
    }
  });

  app.listen(port, () => {
    console.log('[INFO]: Running Portfolio Debugging System (server side)...');
  });
})();
