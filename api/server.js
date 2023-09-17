const express = require("express"),
  bodyParser = require("body-parser"),
  multiparty = require("connect-multiparty");

const app = express();
const { client, connMongoDB } = require("./connection"); // Replace with the correct path to your MongoDB connection file
const { ObjectId } = require("mongodb");
const fs = require("fs");
const fsx = require("fs-extra");
const path = require("path");

// body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

var port = 8080;

app.listen(port);

console.log("Servidor HTTP esta escutando na porta " + port);

// Use async/await for route handlers
app.get("/", function (req, res) {
  res.send({ msg: "Olá" });
});

// POST(create)
app.post("/api", async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const path_origem = req.files.arquivo.path;
  const fileName = req.files.arquivo.name;

  const uploadDirectory = "./uploads"; // Destination directory
  const url_imagem = req.files.arquivo.originalFilename;

  // Ensure the destination directory exists, or create it if not
  fsx
    .ensureDir(uploadDirectory)
    .then(() => {
      // Construct the destination path using path.join
      const filename = path.basename(fileName);
      const path_destino = path.join(uploadDirectory, filename);

      // Move the file to the destination
      fsx.move(path_origem, path_destino, function (err) {
        if (err) {
          console.error(err);
          res.status(500).json({ error: err });
        } else {
          console.log("File moved successfully!");
          // Handle success here
          res.status(200).json({ message: "File uploaded successfully" });
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
      return;
    });
  const dados = {
    url_imagem: url_imagem,
    titulo: req.body.titulo,
  };

  try {
    const db = client.db("instagram");
    const collection = db.collection("postagens");
    const result = await collection.insertOne(dados);
    console.log("Inclusão realizada com sucesso");
  } catch (err) {
    console.error("Erro ao inserir:", err);
  }
});

// GET(ready)
app.get("/api", async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const db = client.db("instagram");
    const collection = db.collection("postagens");
    const results = await collection.find().toArray();
    res.json(results);
  } catch (err) {
    res.json(err);
  }
});

// GET by ID(ready)
app.get("/api/:id", async function (req, res) {
  try {
    const db = client.db("instagram");
    const collection = db.collection("postagens");
    console.log(req.params.id);
    const result = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });
    console.log(req.params.id);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

app.get("/imagens/:imagem", async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const img = req.params.imagem;
  const imagePath = "./uploads/" + img;
  console.log("Image path:", imagePath);

  fs.readFile(imagePath, function (err, content) {
    if (err) {
      if (err.code === "ENOENT") {
        // Handle file not found error with a 404 status
        res.status(404).json({ error: "Image not found" });
      } else {
        // Handle other errors with a 500 status
        res.status(500).json({ error: "Internal server error" });
      }
      return;
    }
    const contentType = img.endsWith(".png")
      ? "image/png"
      : img.endsWith(".gif")
      ? "image/gif"
      : "image/jpeg";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

// PUT by ID(update)
app.put("/api/:id", async function (req, res) {
  console.log(req.body.titulo);
  try {
    const db = client.db("instagram");
    const collection = db.collection("postagens");
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { titulo: req.body.titulo } }
    );
    if (result.modifiedCount === 1) {
      res.json({ status: "atualização realizada com sucesso" });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (err) {
    res.json(err);
  }
});

// DELETE by ID(delete)
app.delete("/api/:id", async function (req, res) {
  try {
    const db = client.db("instagram");
    const collection = db.collection("postagens");
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 1) {
      res.json({ status: "exclusão realizada com sucesso" });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (err) {
    res.json(err);
  }
});

// Connect to MongoDB
connMongoDB();
