require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const Item = require("./models/Item");

const app = express();
app.use(cors());
app.use(bodyParser.json());

morgan.token("body", req => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :body - status :status length :res[content-length] - :response-time ms"
  )
);

app.use(express.static(path.resolve(__dirname, "../frontend/build")));

app.get("/info", (req, res, next) => {
  Item.countDocuments()
    .then(result => {
      const message = `<p>Phonebook has info for ${result} people</p><p>${new Date()}</p>`;
      res.send(message).end();
    })
    .catch(error => next(error));
});

app.get("/api/persons", (req, res, next) => {
  Item.find({})
    .then(result => {
      res.status(200).json(result.map(i => i.toJSON()));
    })
    .catch(error => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Item.findById(id)
    .then(item => {
      if (item) {
        res.json(item.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Item.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

const checkGetPostBody = (req, res) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({ error: "the name field is missing" });
  }
  if (!body.number) {
    return res.status(400).json({ error: "the number field is missing" });
  }
  return body;
};

app.post("/api/persons", (req, res, next) => {
  const body = checkGetPostBody(req, res);
  // if (items.find(i => i.name === body.name)) {
  //   return res.status(400).json({ error: "the name must be unique" });
  // }
  const item = new Item({
    name: body.name,
    number: body.number
  });
  item
    .save()
    .then(newItem => {
      res.json(newItem.toJSON());
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = checkGetPostBody(req, res);
  const id = req.params.id;
  const item = { name: body.name, number: body.number };
  Item.findByIdAndUpdate(id, item, { new: true })
    .then(newItem => {
      if (newItem) {
        res.json(newItem.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.log(error);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return response.status(400).send({ error: "malformed id" });
  }

  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});
