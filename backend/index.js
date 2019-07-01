const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

let items = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

const generateNewId = () => {
  let r;
  do {
    r = Math.round(Math.random() * 10000000000 + 1);
  } while (items.find(i => i.id === r));
  return r;
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(express.static(path.resolve(__dirname, "../frontend/build")));

app.get("/info", (req, res) => {
  const message = `<p>Phonebook has info for ${
    items.length
  } people</p><p>${new Date()}</p>`;
  res.send(message).end();
});

app.get("/api/persons", (req, res) => {
  res.json(items);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  items = items.filter(i => i.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const id = generateNewId();
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({ error: "the name field is missing" });
  }
  if (!body.number) {
    return res.status(400).json({ error: "the number field is missing" });
  }
  if (items.find(i => i.name === body.name)) {
    return res.status(400).json({ errpr: "the name must be unique" });
  }
  const item = {
    id: id,
    name: body.name,
    number: body.number
  };
  items = items.concat(item);
  return res.json(item);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});
