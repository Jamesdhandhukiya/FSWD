const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: "library-secret-key", // should be long & secure in real apps
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }, // session expires in 10 minutes
  })
);

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  const { name } = req.body;
  if (name) {
    req.session.user = {
      name,
      loginTime: new Date().toLocaleString(),
    };
    res.redirect("/profile");
  } else {
    res.send("Please enter a valid name.");
  }
});

app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.render("profile", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.redirect("/");
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
