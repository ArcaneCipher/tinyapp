const express = require("express");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080; // default port 8080
const SALT_ROUNDS = 10; // bcrypt salt rounds as a constant

// Import helper functions
const {
  generateRandomString,
  getUserByEmail,
  getUserFromCookie,
  isValidURL,
  renderError,
  urlsForUser,
} = require("./helpers");

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Middleware to parse URL-encoded data from POST requests
app.use(express.urlencoded({ extended: true }));

// Middleware to enable support for PUT and DELETE methods
app.use(methodOverride("_method"));

// Middleware to encrypt and manage cookies
app.use(
  cookieSession({
    name: "session",
    keys: [
      "899bec41a247a9a5ed31af777b24b4ab0706a57a4ed810351a1a2217a199a870",
      "58ccc40fd5b9e0648a90037c188eccd6233826dcfc27d934e9868f4734bcbe92",
      "696af373891891d9ecb1b0fbd0cc8fba4ed41484f2e7383dd9731c8963723312",
      "934ed97c8379b188615e085c5b5dc8f8f82498f7039891c6ffccfdc27b3e53ea",
      "14b68a7740c097fd444eaf8f08e18dd954299a6d6f7bb58c1253a3c71f60268d",
    ],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// URL database to store short and long URL mappings
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
    visitCount: 0,
    uniqueVisitors: {},
    visitLog: [],
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
    visitCount: 0,
    uniqueVisitors: {},
    visitLog: [],
  },
};

// users object with placeholder for hashed passwords
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", SALT_ROUNDS),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", SALT_ROUNDS),
  },
};

//// GET ////

// Route for root path - returns a simple greeting
app.get("/", (req, res) => {
  const user = getUserFromCookie(req, users);

  if (user) {
    return res.redirect("/urls"); // If user is logged in, redirect to /urls
  }
  return res.redirect("/login"); // If user is not logged in, redirect to /login
});

// Route to return urlDatabase as JSON (optional)
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// Route to display all URLs in the urlDatabase
app.get("/urls", (req, res) => {
  const user = getUserFromCookie(req, users);

  // Check if user is logged in
  if (!user) {
    return renderError(
      res,
      403,
      "You must be logged in to view your URLs.",
      "/login",
      user
    );
  }

  const userUrls = urlsForUser(user.id, urlDatabase);

  const templateVars = {
    urls: userUrls,
    user,
  };
  res.render("urls_index", templateVars);
});

// Route to render form for creating a new short URL
app.get("/urls/new", (req, res) => {
  const user = getUserFromCookie(req, users);
  const templateVars = {
    user,
  };

  // If user is not logged in, redirect to /login
  if (!user) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

// Route to display a specific short URL and its long URL
app.get("/urls/:id", (req, res) => {
  const user = getUserFromCookie(req, users);
  const url = urlDatabase[req.params.id];
  const id = req.params.id;

  // Check if url is in urlDatabase
  if (!url) {
    return renderError(res, 404, "Short URL not found.", "/urls", user);
  }

  // Check if user is logged in and owns the URL
  if (!user || url.userID !== user.id) {
    return renderError(
      res,
      403,
      "You do not have permission to view this URL.",
      "/login",
      user
    );
  }

  const templateVars = {
    id,
    url,
    user,
  };

  res.render("urls_show", templateVars);
});

// Route to handle redirection for short URLs
app.get("/u/:id", (req, res) => {
  const urlEntry = urlDatabase[req.params.id]; // Retrieve the long URL from urlDatabase

  // Check if urlEntry exists
  if (!urlEntry) {
    return renderError(res, 404, "Short URL not found.", "/urls", null);
  }

  // Increment visit count
  urlEntry.visitCount += 1;

  // Assign a visitorID to the session if not already set
  if (!req.session.visitor_id) {
    req.session.visitor_id = generateRandomString(urlEntry.uniqueVisitors);
  }

  const visitorID = req.session.visitor_id;

  // Track unique visitors using an object
  if (!urlEntry.uniqueVisitors[visitorID]) {
    urlEntry.uniqueVisitors[visitorID] = true;
  }

  // Log the visit
  urlEntry.visitLog.push({
    timestamp: new Date().toISOString(),
    visitorID: visitorID,
  });

  // Redirect to the long URL
  res.redirect(urlEntry.longURL);
});

// Route to render the registration page
app.get("/register", (req, res) => {
  const user = getUserFromCookie(req, users);

  // If user is logged in, redirect to /urls
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
  };

  res.render("register", templateVars);
});

// Route to render the login page
app.get("/login", (req, res) => {
  const user = getUserFromCookie(req, users);

  // If user is logged in, redirect to /urls
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
  };

  res.render("login", templateVars); // Render login.ejs
});

//// POST ////

// Route to handle form submission for creating a new short URL
app.post("/urls", (req, res) => {
  const user = getUserFromCookie(req, users);

  // If user is logged in
  if (!user) {
    return renderError(
      res,
      403,
      "You must be logged in to create short URLs.",
      "/login",
      user
    );
  }

  const longURL = req.body.longURL; // Get the long URL from the form input

  if (!isValidURL(longURL)) {
    return renderError(
      res,
      400,
      "Invalid URL format. Please provide a valid URL.",
      "/urls",
      user
    );
  }

  const id = generateRandomString(urlDatabase); // Generate a unique short URL ID
  // Store the long URL and userID with the generated ID
  urlDatabase[id] = {
    longURL,
    userID: user.id,
    visitCount: 0,
    uniqueVisitors: {},
    visitLog: [],
  };
  res.redirect(`/urls/${id}`); // Redirect to the new short URL's page
});

// Route to handle URL edit (PUT)
app.put("/urls/:id", (req, res) => {
  const user = getUserFromCookie(req, users);
  const url = urlDatabase[req.params.id];

  // Check if url is in urlDatabase
  if (!url) {
    return renderError(res, 404, "Short URL not found.", "/urls", user);
  }

  // Check if user is logged in
  if (!user || url.userID !== user.id) {
    return renderError(
      res,
      403,
      "You do not have permission to view this URL.",
      "/login",
      user
    );
  }

  // Validate the new URL
  const newLongURL = req.body.longURL;
  if (!isValidURL(newLongURL)) {
    return renderError(
      res,
      400,
      "Invalid URL format. Please provide a valid URL.",
      "/urls",
      user
    );
  }

  // Update the long URL if validation passes
  url.longURL = newLongURL;

  // Redirect back to the main URLs page after the edit
  res.redirect("/urls");
});

// Route to handle URL deletion (DELETE)
app.delete("/urls/:id", (req, res) => {
  const user = getUserFromCookie(req, users);
  const url = urlDatabase[req.params.id];

  // Check if url is in urlDatabase
  if (!url) {
    return renderError(res, 404, "Short URL not found.", "/urls", user);
  }

  // Check if user is logged in
  if (!user || url.userID !== user.id) {
    return renderError(
      res,
      403,
      "You do not have permission to delete this URL.",
      "/login",
      user
    );
  }

  // Delete url entry
  delete urlDatabase[req.params.id];

  // Redirect back to the main URLs page after deletion
  res.redirect("/urls");
});

// Route to render login and set a user_id cookie
app.post("/login", (req, res) => {
  const verifyLogin = getUserFromCookie(req, users);

  // If user is logged in, redirect to /urls
  if (verifyLogin) {
    return res.redirect("/urls");
  }

  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return renderError(
      res,
      400,
      "Email and password must be provided.",
      "/login",
      null
    );
  }

  // Find user by email
  const user = getUserByEmail(email, users);

  // Check if user exists and password matches
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return renderError(res, 403, "Invalid email or password.", "/login", null);
  }

  // Set a cookie with the user's ID
  req.session.user_id = user.id;

  // Redirect back to the main URLs page after login
  res.redirect("/urls");
});

// Route to handle logout and clear the user_id cookie
app.post("/logout", (req, res) => {
  req.session = null; // Clear the user_id cookie
  res.redirect("/login"); // Redirect to /urls for now
});

// Route to handle user registration
app.post("/register", (req, res) => {
  const user = getUserFromCookie(req, users);

  // If user is logged in, redirect to /urls
  if (user) {
    return res.redirect("/urls");
  }

  const { email, password } = req.body;

  // Check for missing email or password fields
  if (!email || !password) {
    return renderError(
      res,
      400,
      "Email and password cannot be blank.",
      "/register",
      user
    );
  }

  // Check if email is already registered
  if (getUserByEmail(email, users)) {
    return renderError(
      res,
      400,
      "Email is already registered.",
      "/register",
      user
    );
  }

  // Check if password meets site requirements
  if (password.length < 8) {
    return renderError(
      res,
      400,
      "Password must be at least 8 characters long.",
      "/register",
      user
    );
  }

  // Generate a unique ID for the new user
  const userID = generateRandomString(urlDatabase);

  // Generate hashed password for user
  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

  // Create the new user object
  const newUser = {
    id: userID,
    email: email,
    password: hashedPassword,
  };

  // Add the new user to the users object
  users[userID] = newUser;

  // Set a cookie with the new user's ID
  req.session.user_id = userID;

  // Redirect to /urls
  res.redirect("/urls");
});

//// LISTEN ////

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
