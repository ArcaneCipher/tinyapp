const { assert } = require("chai");
const {
  generateRandomString,
  getUserByEmail,
  getUserFromCookie,
  isValidURL,
  renderError,
  urlsForUser,
} = require("../helpers");

///// MOCK DATA FOR TESTING /////

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

// Mock test cases for renderError testing
const testCases = [
  {
    description: "renders the correct status code and template for a 404 error",
    input: {
      errorCode: 404,
      message: "Not Found",
      returnUrl: "/urls",
      user: null,
    },
    expected: { statusCode: 404, template: "error" },
  },
  {
    description: "renders the correct status code and template for a 403 error",
    input: {
      errorCode: 403,
      message: "Forbidden",
      returnUrl: "/login",
      user: null,
    },
    expected: { statusCode: 403, template: "error" },
  },
  {
    description: "renders with a user object and valid redirect URL",
    input: {
      errorCode: 400,
      message: "Bad Request",
      returnUrl: "/register",
      user: { id: "user1", email: "user1@example.com" },
    },
    expected: { statusCode: 400, template: "error" },
  },
];

///// HELPER FUNCTIONS /////

// Helper function to mock request objects
const createMockRequest = (userId) => ({
  session: {
    // eslint-disable-next-line camelcase
    user_id: userId,
  },
});

// Helper function to mock a response object
const createMockResponse = () => {
  const res = {};
  res.statusCode = null;
  res.template = null;
  res.locals = {};
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.render = function(template, locals) {
    this.template = template;
    this.locals = locals;
    return this;
  };
  return res;
};

///// TESTS /////

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

describe("urlsForUser", () => {
  // Test for URLs associated to user
  it("should return the URLs that belong to the specified user", () => {
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
    };
    const result = urlsForUser("userRandomID", mockDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  // Test for no URLs associated to user
  it("should return an empty object if the user has no URLs", () => {
    const result = urlsForUser("nonExistentUser", mockDatabase);
    assert.deepEqual(result, {});
  });

  // Test for empty database
  it("should return an empty object if the database is empty", () => {
    const emptyDatabase = {};
    const result = urlsForUser("userRandomID", emptyDatabase);
    assert.deepEqual(result, {});
  });

  // Test should not return URLs from another user
  it("should not return URLs that do not belong to the specified user", () => {
    const userUrls = urlsForUser("userRandomID", mockDatabase);
    const doesNotBelong = Object.keys(userUrls).some(
      (id) => mockDatabase[id].userID !== "userRandomID"
    );

    assert.isFalse(
      doesNotBelong,
      "URLs that do not belong to the user should not be returned"
    );
  });
});

describe("getUserFromCookie", () => {
  // Test for user_id in cookie session
  it("should return the user object if the user_id exists in the session", () => {
    const req = createMockRequest("userRandomID");
    const user = getUserFromCookie(req, testUsers);
    assert.deepEqual(user, testUsers["userRandomID"]);
  });

  // Test for user_id not in cookie session
  it("should return null if the user_id is not present in the session", () => {
    const req = createMockRequest(null); // No user_id in session
    const user = getUserFromCookie(req, testUsers);
    assert.isNull(user);
  });

  // Test for user_id in session not matching users
  it("should return null if the user_id in the session does not match any user", () => {
    const req = createMockRequest("nonExistentUser");
    const user = getUserFromCookie(req, testUsers);
    assert.isNull(user);
  });
});

describe("renderError", () => {
  testCases.forEach(({ description, input, expected }) => {
    it(description, () => {
      const res = createMockResponse();
      const { errorCode, message, returnUrl, user } = input;

      renderError(res, errorCode, message, returnUrl, user);

      assert.strictEqual(res.statusCode, expected.statusCode);
      assert.strictEqual(res.template, expected.template);
      assert.deepEqual(res.locals, {
        errorCode,
        message,
        returnUrl,
        user,
      });
    });
  });
});
