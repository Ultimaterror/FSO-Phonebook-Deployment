const express = require("express");
const app = express();
let morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :response-time ms - :res[content-length] :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/info", (req, res) => {
  res.send(
    `<div><p>Phonebook has info for ${
      persons.length
    } people</p><p>${new Date().toUTCString()}</p></div>`
  );
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.post("/api/persons", (req, res) => {
  const data = req.body;

  if (!data.name || !data.number) {
    return res.status(400).json({
      error: "name or number missing",
    });
  }

  if (persons.find((person) => person.name === data.name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const newPerson = {
    id: Math.floor(Math.random() * 100000),
    name: data.name,
    number: data.number,
  };

  persons = persons.concat(newPerson);

  res.json(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.put("/api/persons/:id", (req, res) => {
  const data = req.body;

  if (!data.number) {
    return res.status(400).json({
      error: "number missing",
    });
  }

  const id = parseInt(req.params.id);

  const newPerson = {
    id: id,
    name: data.name,
    number: data.number,
  };
  const person = persons.find((person) => person.id === id);

  if (person) {
    persons = persons.map((person) =>
      person.id !== newPerson.id ? person : newPerson
    );
  } else {
    res.status(404).end();
  }

  res.json(newPerson);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = parseInt(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
