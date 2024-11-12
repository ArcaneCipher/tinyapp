const { assert } = require("chai");
const {
  generateRandomString,
  getUserByEmail,
  isValidURL,
} = require("../helpers");

// Mock users database
const testUsers = {
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

// Mock url database (can be empty since retries = 0 ensures failure)
const mockDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

describe("getUserByEmail", () => {
  // Test if the email exists
  it("should return a user object if the email exists", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.deepEqual(user, {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    });
  });

  //Test non-existent emails
  it("should return null if the email does not exist", () => {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user);
  });
});

describe("generateRandomString", () => {
  // Test function returns 6 characters
  it("should return a string of 6 characters", () => {
    const randomString = generateRandomString(mockDatabase);
    assert.isString(randomString);
    assert.lengthOf(randomString, 6);
  });

  // Test function returns unique strings (in theory this could fail)
  it("should generate unique strings for multiple calls", () => {
    const strings = new Set();
    for (let i = 0; i < 100; i++) {
      strings.add(generateRandomString(mockDatabase));
    }
    assert.strictEqual(strings.size, 100);
  });

  // Test for failure when maxRetries exceeded
  it("should throw an error if maxRetries is exceeded", () => {
    assert.throws(
      () => generateRandomString(mockDatabase, 0),
      "Unable to generate a unique string after maximum retries."
    );
  });
});

describe("isValidURL", () => {
  // Test for valid http
  it("should return true for a valid URL with http", () => {
    const result = isValidURL("http://example.com");
    assert.isTrue(result);
  });

  // Test for valid https
  it("should return true for a valid URL with https", () => {
    const result = isValidURL("https://example.com");
    assert.isTrue(result);
  });

  // Test string without a protocol
  it("should return false for a string without a protocol", () => {
    const result = isValidURL("example.com");
    assert.isFalse(result);
  });

  // Test empty string
  it("should return false for an empty string", () => {
    const result = isValidURL("");
    assert.isFalse(result);
  });

  // Test non-url strings
  it("should return false for non-URL strings", () => {
    const result = isValidURL("not a url");
    assert.isFalse(result);
  });

  // Test for null input
  it("should return false for null input", () => {
    const result = isValidURL(null);
    assert.isFalse(result);
  });

  // Test for undefined input
  it("should return false for undefined input", () => {
    const result = isValidURL(undefined);
    assert.isFalse(result);
  });
});
