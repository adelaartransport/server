const express = require("express");
const axios = require("axios");
const fs = require("fs");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // This will parse incoming JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Dummy credentials
const USERNAME = "admin";
const PASSWORD = "password123";

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.user = username;
    res.redirect("/data");
  } else {
    res.send("Invalid credentials! <a href='/login'>Try again</a>");
  }
});

app.post("/submit", (req, res) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    distance: req.body.distance,
    freightType: req.body.freightType,
    loadType: req.body.loadType,
    submittedAt: new Date().toISOString(),
  };

  console.log(newData);
  fs.readFile("data.json", "utf8", (err, data) => {
    let existingData = [];
    if (!err && data) {
      existingData = JSON.parse(data);
    }
    existingData.push(newData);

    fs.writeFile("data.json", JSON.stringify(existingData, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Error saving data.");
      }
      res
        .status(201)
        .json({ success: true, message: "Data saved successfully!" });
    });
  });
});

app.get("/data", isAuthenticated, (req, res) => {
  const jsonData = JSON.parse(fs.readFileSync("data.json"));
  res.render("data", { data: jsonData });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
