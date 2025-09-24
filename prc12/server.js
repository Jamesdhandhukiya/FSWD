const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Handle form submission
app.post("/calculate", (req, res) => {
  let { num1, num2, operation } = req.body;

  // Convert inputs to numbers
  num1 = parseFloat(num1);
  num2 = parseFloat(num2);

  // Validate input
  if (isNaN(num1) || isNaN(num2)) {
    return res.send(`<h2>Invalid input. Please enter numbers only.</h2>
                     <a href="/">Go Back</a>`);
  }

  let result;
  switch (operation) {
    case "add":
      result = num1 + num2;
      break;
    case "subtract":
      result = num1 - num2;
      break;
    case "multiply":
      result = num1 * num2;
      break;
    case "divide":
      if (num2 === 0) {
        return res.send(`<h2>Cannot divide by zero!</h2>
                         <a href="/">Go Back</a>`);
      }
      result = num1 / num2;
      break;
    default:
      return res.send(`<h2>Unknown operation.</h2>
                       <a href="/">Go Back</a>`);
  }

  res.send(`
    <h2>Result: ${result}</h2>
    <a href="/">🔙 Calculate Again</a>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Calculator app running at http://localhost:${PORT}`);
});
