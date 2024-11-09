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

// users object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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

// Helper function to get user object from user_id cookie
function getUserFromCookie(req) {
  const userId = req.cookies["user_id"];
  return users[userId];
}

// Helper function to find a user by email
function getUserByEmail(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
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
  const user = getUserFromCookie(req); // Retrieve user object using user_id cookie
  const templateVars = {
    urls: urlDatabase,
    user: user || null, // Pass user object or null if not logged in
  };
  res.render("urls_index", templateVars);
});

// Route to render form for creating a new short URL
app.get("/urls/new", (req, res) => {
  const user = getUserFromCookie(req);
  const templateVars = {
    user: user || null, // Pass user object to render the header correctly
  };
  res.render("urls_new", templateVars);
});

// Route to display a specific short URL and its long URL
app.get("/urls/:id", (req, res) => {
  const user = getUserFromCookie(req);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user || null, // Pass user object for header display
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
  const user = getUserFromCookie(req);
  const templateVars = {
    user: user || null, // Pass the user_id cookie if it exists
  };
  res.render("register", templateVars);
});

// Route to render the login page
app.get("/login", (req, res) => {
  const user = getUserFromCookie(req); // Retrieve user object using user_id cookie
  const templateVars = {
    user: user || null, // Pass the user object for header rendering
  };
  res.render("login", templateVars); // Render login.ejs
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

// Route to render login and set a user_id cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = Object.values(users).find((u) => u.email === email);

  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(403).send("Error: Invalid email or password.");
  }

  // Set a cookie with the user's ID
  res.cookie("user_id", user.id);

  // Redirect back to the main URLs page after login
  res.redirect("/urls");
});

// Route to handle logout and clear the user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the user_id cookie
  res.redirect("/urls"); // Redirect to /urls for now
});

// Route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check for missing email or password fields
  if (!email || !password) {
    return res.status(400).send("Error: Email and password cannot be blank.");
  }

  // Check if email is already registered
  if (getUserByEmail(email)) {
    return res.status(400).send("Error: Email is already registered.");
  }

  // Generate a unique ID for the new user
  const userID = generateRandomString();

  // Create the new user object
  const newUser = {
    id: userID,
    email: email,
    password: password,
  };

  // Add the new user to the users object
  users[userID] = newUser;

  // Set a cookie with the new user's ID
  res.cookie("user_id", userID);

  // Redirect to /urls
  res.redirect("/urls");
});

//// LISTEN ////

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
