import express from "express";
import cors from "cors";
import fsp from "fs/promises";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";

const PORT = 8000;
const HOST = "localhost";
const __dirName = path.resolve();

const user = {
  id: 123,
  username: "user",
  password: "123456",
};

const corsOptions = {
  credentials: true,
  origin: "*",
};

const isAuth = (req, res, next) => {
  const {username, password} = req.body;
  if (username === user.username && password === user.password) {
    res.cookie("userId", user.id, {
      maxAge: 3600 * 48,
    });
    res.cookie("authorized", true, {
      maxAge: 3600 * 48,
    });
    next();
  } else {
    res.status(401).send("Неверный логин или пароль");
  }
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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
  }

  if (req.url === "/post") {
    if (!req.headers.cookie) {
      res.status(401).send("Пользователь не авторизован");
    }
    if (req.cookies.authorized) {
      res.status(200);
      const post = req.body;
      fs.writeFile(
        path.join(__dirName, "files", post.fileName + ".txt"),
        post.content,
        {
          encoding: "utf8",
        },
        (err) => {
          if (err) console.log(err);
          console.log(
            `Файл с названием ${post.fileName}.txt успешно создан`
          );
        }
      );
      res.send(`Файл с названием ${post.fileName}.txt успешно создан`);

    }
  }


  if (req.url === "/delete") {
    const fileName = req.body.filename;
    if (!req.headers.cookie) {
      res.status(401).send("Пользователь не авторизован");
    }

    if (req.cookies.authorized) {
      res.status(200);
      fs.unlink(path.join(__dirName, "files", fileName + ".txt"), (err) => {
        if (err) console.log(err);
        console.log(`Файл с названием ${fileName}.txt успешно удален`);
      });
      res.send(`Файл с названием ${fileName}.txt успешно удален`);
    }

    if (req.url === "/redirect") {
      res.status(308).send("Ресурс по адресу /redirected");
    }
  }

  if (req.url === "/auth") {
    res.status(200).send("Пользователь авторизован");
  }
};

// AUTH
app
  .route("/auth")
  .post(isAuth, requestListener)
  .all((req, res) => {
    res.status(405).send("HTTP method not allowed");
  });

// =================================================================

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
