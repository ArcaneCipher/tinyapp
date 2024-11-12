# TinyApp

TinyApp is a full-stack web application built with Node.js and Express. It allows users to shorten long URLs, similar to services like bit.ly. This project demonstrates fundamental skills in server-side development, route handling, and session management while implementing features like analytics and user authentication.

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Analytics Features](#analytics-features)
7. [Project Structure](#project-structure)
8. [Technologies Used](#technologies-used)
9. [Contributing](#contributing)
10. [License](#license)

---

## Features

- **URL Shortening**: Users can create short URLs for any valid web address.
- **User Authentication**: Registration and login capabilities using encrypted cookies.
- **Personalized URL Management**: Each user can manage their own URLs (edit/delete).
- **Visit Tracking**:
  - **Total Visits**: Track the total number of visits to each short URL.
  - **Unique Visitors**: Track the number of unique visitors using cookies.
  - **Visit Logs**: View the full history of visits, including timestamps and visitor IDs.
- **Responsive UI**: Built with Bootstrap for a clean and responsive design.
- **Error Handling**: Graceful error messages for invalid actions or inaccessible routes.

---

## Getting Started

Follow these instructions to get a copy of TinyApp up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/ArcaneCipher/tinyapp.git
   cd tinyapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Visit the app in your browser at:

   ```bash
   http://localhost:8080
   ```

---

## Usage

1. **Register**:
   - Navigate to `/register` to create an account.
2. **Log In**:
   - Navigate to `/login` to sign in and access your personalized URL dashboard.
3. **Create a Short URL**:
   - Click "Create New URL" to shorten a long URL.
4. **Manage URLs**:
   - Edit or delete your short URLs from the dashboard.
5. **Share Short URLs**:
   - Share the generated short URL with others for redirection.

---

## Analytics Features

TinyApp provides in-depth analytics for each URL:

- **Visit Count**: Displays the total number of visits for each short URL.
- **Unique Visitors**: Tracks distinct users using cookies to provide a unique count.
- **Visit Log**: Records each visit with a timestamp and a randomly generated visitor ID.

---

## Project Structure

```plaintext
tinyapp/
├── test/               # Testing using mocha/chai
│   ├── helpersTest.js  # Tests for server Helper functions
├── views/              # EJS templates
│   ├── partials/       # Reusable partial templates (header, footer)
|   |   ├── _header.ejs # header template for views
│   ├── urls_index.ejs  # Dashboard for URLs
│   ├── urls_new.ejs    # Form for creating new URLs
│   ├── urls_show.ejs   # URL details with analytics
│   ├── login.ejs       # Login form
│   ├── register.ejs    # Registration form
│   ├── error.ejs       # Clean HTML error page
├── .gitignore          # gitignore to ignore node_modules
├── helpers.js          # Helper functions for the server
├── express_server.js   # Main server file
├── package.json        # Dependencies and scripts
├── package-lock.json   # Dependencies and scripts
└── README.md           # Project documentation
```

---

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
- **Frontend**:
  - EJS (Embedded JavaScript templates)
  - Bootstrap
- **Authentication**:
  - `cookie-session` for session management
  - `bcrypt` for password hashing
- **Analytics**:
  - Session cookies for tracking unique visitors

---

## Contributing

Contributions are welcome! If you'd like to contribute, please:

1. Fork this repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature-name`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---
