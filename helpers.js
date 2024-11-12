// Function to generate a random 6-character alphanumeric string
const generateRandomString = function (urlDatabase, maxRetries = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Loop and check for string collision
  for (let i = 0; i < maxRetries; i++) {
    let result = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * 62);
      result += characters[randomIndex];
    }

    // Check for collision
    if (!urlDatabase[result]) {
      return result;
    }
  }

  throw new Error("Unable to generate a unique string after maximum retries.");
};

// Helper function to find a user by email
const getUserByEmail = function (email, usersDatabase) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Helper function to get user object from user_id cookie
const getUserFromCookie = function (req, users) {
  const userId = req.session.user_id;
  return users[userId] || null; // Explicitly return null if the user_id is not found
};

// Helper function: Validate URL
const isValidURL = function (url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper function to render error pages
const renderError = (res, errorCode, message, returnUrl, user) => {
  res.status(errorCode).render("error", {
    errorCode,
    message,
    returnUrl,
    user,
  });
};

// Helper function: Filter URLs by user ID
const urlsForUser = function (userID, urlDatabase) {
  const userUrls = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      userUrls[id] = urlDatabase[id];
    }
  }
  return userUrls;
};

// EXPORT MODULES
module.exports = {
  generateRandomString,
  getUserByEmail,
  getUserFromCookie,
  isValidURL,
  renderError,
  urlsForUser,
};
