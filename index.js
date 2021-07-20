const express = require('express');
const bodyParser = require('body-parser');
const simple = require('./simple');

(async () => {
  const app = express();
  const port = 3000;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post('/simple/person/:nitType/:nit', async (req, res) => {
    try {
      await simple.run(req.params, req.body);
      res.json({ message: 'OK' });
    } catch (exception) {
      if (exception.hasOwnProperty('status') && exception.hasOwnProperty('message')) {
        res.status(exception.status).json({ err: exception.message });
      } else {
        console.log('[DEBUG]: Something crashes.');
        console.log('[ERROR]: ', exception);
        res.status(500).json({ err: exception.message });
      }
    }

    console.log('[DEBUG]: Done');
  });

  app.listen(port, () => {
    console.log('[INFO]: Running Portfolio Debugging System (server side)...');
  });
})();
