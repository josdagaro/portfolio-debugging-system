const express = require('express');
const bodyParser = require('body-parser');
const simple = require('./simple');
const soi = require('./soi');
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

  app.get("/files", (req, res) => {
    let simplePdfFiles = [];
    simplePdfFiles = global.refreshFiles('simple');
    simplePdfFiles = global.filterFiles(simplePdfFiles);
    simplePdfFiles = simplePdfFiles.length > 0 ? simplePdfFiles : [];
    soiPdfFiles = global.refreshFiles('soi');
    soiPdfFiles = global.filterFiles(soiPdfFiles);
    soiPdfFiles = soiPdfFiles.length > 0 ? soiPdfFiles : [];
    res.render("pdfs", { simplePdfFiles, soiPdfFiles, platform1: 'Simple', platform2: 'SOI' });
  });

  app.post('/simple/person/:nitType/:nit', async (req, res) => {
    try {
      let pdfFiles = [];
      pdfFiles = global.refreshFiles('simple');
      pdfFiles = global.filterFiles(pdfFiles);
      global.deleteFiles('simple', global.extractFilesNames(pdfFiles));
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

  app.post('/soi/person/:nitType/:nit', async (req, res) => {
    try {
      let pdfFiles = [];
      pdfFiles = global.refreshFiles('soi');
      pdfFiles = global.filterFiles(pdfFiles);
      global.deleteFiles('soi', global.extractFilesNames(pdfFiles));
      await soi.run(req.params, req.body);
      pdfFiles = global.refreshFiles('soi');
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
