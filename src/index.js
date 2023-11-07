require("dotenv").config();
const express = require("express");
const app = express();
let morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

// morgan.token("body", function (req, res) {
//   return JSON.stringify(req.body);
// });

app.use(morgan("dev"));

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/info", (req, res) => {
  Person.countDocuments().then((result) => {
    res.send(
      `<div><p>Phonebook has info for ${result} people</p><p>${new Date().toUTCString()}</p></div>`
    );
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.post("/api/persons", (req, res, next) => {
  const data = req.body;

  if (!data.name || !data.number) {
    return res.status(400).json({
      error: "name or number missing",
    });
  }

  const newPerson = new Person({
    name: data.name,
    number: data.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      person ? res.json(person) : res.sendStatus(404);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const data = req.body;

  const person = {
    name: data.name,
    number: data.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(res.sendStatus(204));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
