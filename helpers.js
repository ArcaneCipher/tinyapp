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

// EXPORT MODULES
module.exports = {
  getUserByEmail,
};
