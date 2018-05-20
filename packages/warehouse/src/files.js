// @flow

import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import tar from 'tar';
import type { $Application, NextFunction } from 'express';

export default function registerUploadHandler(app: $Application, fileDropLocation: string) {
  const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
      const { appName, partName } = req.body;
      const dest = path.join(fileDropLocation, appName, partName);

      fs.ensureDir(dest).then(() => {
        cb(null, dest);
      });
    },
    filename: function(req, file, cb) {
      const fileName = `${req.body.version}.tar.gz`;

      cb(null, fileName);
    },
  });
  const upload = multer({ storage: fileStorage });
  const uploader = upload.single('part');

  function handleUploadRequest(req, res, next: NextFunction) {
    const outputDirectory = path.join(req.file.destination, req.body.version);
    fs.ensureDir(outputDirectory).then(() => {
      fs.emptyDir(outputDirectory).then(() => {
        tar
          .x({
            file: req.file.path,
            cwd: outputDirectory,
          })
          .then(() => {
            res.send('OK');
          });
      });
    });
  }

  app.post('/upload', uploader, handleUploadRequest);
}
