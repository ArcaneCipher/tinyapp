const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // Set EJS as the templating engine

app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data from POST requests
app.use(cookieParser()); // Middleware to parse cookies

// URL database to store short and long URL mappings
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Function to generate a random 6-character alphanumeric string
function generateRandomString(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * 62);
    result += characters[randomIndex];
  }
  return result;
}

//// GET ////

// Route for root path - returns a simple greeting
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route to return urlDatabase as JSON (optional)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to display all URLs in the urlDatabase
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"] || null // Retrieve username from the cookie or set null if missing
  };
  res.render("urls_index", templateVars);
});

// Route to render form for creating a new short URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] || null // Pass username to render the header correctly
  };
  res.render("urls_new", templateVars);
});

// Route to display a specific short URL and its long URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"] || null // Pass username for header display
  };

  // Check if the short URL ID exists in urlDatabase; if not, return 404
  if (!templateVars.longURL) {
    return res.status(404).send("Error: Short URL not found.");
  }

  res.render("urls_show", templateVars);
});

// Route to handle redirection for short URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // Retrieve the long URL from urlDatabase
  if (longURL) {
    res.redirect(longURL); // Redirect to the long URL if found
  } else {
    res.status(404).send("Short URL not found"); // Send 404 if the short URL doesn't exist
  }
});

// Route to render the registration page
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] || null // Pass the username cookie if it exists
  };
  res.render("register", templateVars);
});

//// POST ////

// Route to handle form submission for creating a new short URL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Get the long URL from the form input

  // Check if longURL is provided; if not, return a 400 error
  if (!longURL) {
    return res.status(400).send("Error: Please provide a valid URL.");
  }

  const id = generateRandomString(); // Generate a unique short URL ID
  urlDatabase[id] = longURL; // Store the long URL with the generated ID
  res.redirect(`/urls/${id}`); // Redirect to the new short URL's page
});

// Route to handle URL deletion
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  // Check if the short URL ID exists in the database
  if (urlDatabase[id]) {
    delete urlDatabase[id]; // Remove the URL from the database
  }

  // Redirect back to the main URLs page after deletion
  res.redirect("/urls");
});

// Route to handle URL edit
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  // Update the long URL if the short URL ID exists in the database
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
  }

  // Redirect back to the main URLs page after the edit
  res.redirect("/urls");
});

// Route to render login and set a cookie
app.post("/login", (req, res) => {
  const username = req.body.username;

  // Set a cookie named 'username' with the provided username
  res.cookie("username", username);

  // Redirect back to the main URLs page after login
  res.redirect("/urls");
});

// Route to handle logout and clear the username cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username"); // Clear the username cookie
  res.redirect("/urls"); // Redirect to /urls for now
});

//// LISTEN ////

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
