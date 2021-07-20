const express = require('express');
const bodyParser = require('body-parser');
const simple = require('./simple');

(async () => {
  const app = express();
  const port = 3000;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post('/person/:nitType/:nit', async (req, res) => {
    try {
      await simple.run(req.params, req.body);
      console.log('[DEBUG]: Done');
      res.json({ reqParams: req.params, body: req.body }); 
    } catch(exception) {
      res.status(400).json({ err: exception }); 
    }
  });

  app.listen(port, () => {
    console.log('[INFO]: Running Portfolio Debugging System (server side)...');
  });
})();
