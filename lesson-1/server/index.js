import express from "express";
import fsp from "fs/promises";
import fs from "fs";
import path from "path";

const PORT = 8000;
const HOST = "localhost";
const __dirName = path.resolve();

const app = express();

const error = (req, res) => {
  res.status(404).end("not found");
};

const requestListener = (req, res, next) => {
  if (req.url === "/get") {
    res.status(200);
    const dirPath = path.resolve(__dirName, "files");
    fs.readdir(dirPath, {}, (err, files) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        const message = files.join(", ");
        res.send(message);
      }
    });

    /* fsp.readdir(dirPath).then((files) => {
       if (!files) {
         res.status(500).send("Internal Server Error");
       }
       const message = files.join(", ");
       res.send(message);
     });*/
  }

  if (req.url === "/delete" || req.url === "/post") {
    res.status(200).send("OK");
  }

  if (req.url === "/redirect" || req.url === "/post") {
    res.status(308).send("Ресурс по адресу /redirected");
  }
};

// GET
app
  .route("/get")
  .get(requestListener)
  .all((req, res) => {
    res.status(405).send("HTTP method not allowed");
  });

// POST
app
  .route("/post")
  .post(requestListener)
  .all((req, res) => {
    res.status(405).send("HTTP method not allowed");
  });

// DELETE
app
  .route("/delete")
  .delete(requestListener)
  .all((req, res) => {
    res.status(405).send("HTTP method not allowed");
  });

// REDIRECT
app
  .route("/redirect")
  .get(requestListener)
  .all((req, res) => {
    res.status(405).send("HTTP method not allowed");
  });

app.use(error);

app.listen(PORT, HOST, () => {
  console.log("Server starting...");
});
