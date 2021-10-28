const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;
let todos = {
  "todo1 test": true,
  todo2: false,
  todo3: false,
  todo4: true,
  "lorem ipsum": true,
};
app.use(cors());
app.use(express.json());

app.get("/todos", (req, res) => {
  res.json(todos);
});
app.post("/todos", (req, res) => {
  todos = req.body;
  res.json(todos);
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
