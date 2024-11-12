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

// EXPORT MODULES
module.exports = {
  generateRandomString,
  getUserByEmail,
  isValidURL,
  renderError,
};
