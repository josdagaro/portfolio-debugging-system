const express = require('express');
const bodyParser = require('body-parser');
const simple = require('./simple');
const global = require('./global');
const ejs = require("ejs");
const path = require("path");

(async () => {
  const app = express();
  const port = 3000;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.set("view engine", "ejs");
  app.use(express.static('assets'));

  app.use(express.static("public", {
    setHeaders: (res, filepath) =>
      res.attachment(`${path.basename(filepath)}`)
  }));

  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/simple/file/:file", (req, res) => {
    let pdfFiles = [];
    pdfFiles = global.refreshFiles('simple');
    pdfFiles = global.filterFiles(pdfFiles);
    pdfFiles = pdfFiles.length > 0 ? pdfFiles : [];
    const file = pdfFiles.length > 0 ? pdfFiles.find(f => f.name === req.params.file) : "";
    res.render("pdfs", { pdfFiles, file, platform: 'Simple' });
  });

  app.post('/simple/person/:nitType/:nit', async (req, res) => {
    try {
      let pdfFiles = [];
      await simple.run(req.params, req.body);
      pdfFiles = global.refreshFiles('simple');
      pdfFiles = global.filterFiles(pdfFiles);

      res.json({
        message: 'OK',
        data: {
          pdfs: global.extractFilesNames(pdfFiles)
        }
      });
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
