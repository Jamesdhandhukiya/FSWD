const express = require ("express");
const bodyParser = require("body-parser");

const app = express()
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("form", { error: null });
});

app.post("/calculate", (req, res) => {
    let{income1, income2} = req.body;

    if (!income1 || !income2 || isNaN(income1) || isNaN(income2)) {
    return res.render("form", { error: "⚠️ Please enter valid numbers for both incomes." });
  }

  income1 = parseFloat(income1);
  income2 = parseFloat(income2);
  const total = income1 + income2;

  res.render("result", { income1, income2, total });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});






