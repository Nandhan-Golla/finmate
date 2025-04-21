# FinMate
## Features

- **User Authentication**: Register and log in with a username and password.
- **Transaction Management**: Add, update, and delete income/expense transactions.
- **Budget Tracking**: Set and monitor budget goals.
- **Currency Conversion**: Convert amounts between currencies using real-time exchange rates.
- **Responsive Design**: Works on desktop and mobile devices.
- **Dark/Light Mode**: Toggle between themes with persistent settings.

## Tech Stack

### Frontend

- **HTML5**: Structure for `rec.html` (login page) and other pages.
- **CSS3**: Styling with responsive design and glassmorphism effects.
- **JavaScript**: Client-side logic for login, theme toggling, and API calls.
- **GSAP (GreenSock Animation Platform)**: Animations for smooth UI transitions.
- **Font Awesome**: Icons for theme toggle (sun/moon).
- **Spline Design**: Embedded 3D particle nebula in the login page background.

### Backend

- **Node.js**: Runtime for the server.
- **Express.js**: Web framework for API endpoints.
- **MongoDB**: NoSQL database for storing users, transactions, and budgets.
- **Mongoose**: ODM for MongoDB schema management.
- **JSON Web Token (JWT)**: Secure user authentication.
- **Axios**: HTTP client for currency conversion API requests.
- **CORS**: Enables cross-origin requests from the frontend.

### External Services

- **ExchangeRate-API**: Provides real-time currency exchange rates.
- **MongoDB (Local)**: Database hosted on `mongodb://localhost:27017/finmate`.

## File Structure

```
finmate/
├── server.js                # Backend server (Express + MongoDB)
├── rec.html                 # Login page
├── Dashboard.html           # Dashboard page (placeholder, update as needed)
├── add-payment.html         # Page for adding transactions
├── currency-converter.html  # Page for currency conversion
├── live.html                # Page for live data (placeholder)
├── com.html                 # Community page (placeholder)
├── package.json             # Node.js project metadata and dependencies
└── README.md                # Project documentation
```

## Prerequisites

- **Node.js** (v14 or later): Download
- **MongoDB Community Edition** (v4.4 or later): Download
- **Git**: For version control and GitHub upload.
- **A modern web browser**: Chrome, Firefox, or Edge.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Nandhan-Golla/finmate.git
cd finmate
```

### 2. Install MongoDB

- Install MongoDB Community Edition: Instructions.
- Start the MongoDB server:

  ```bash
  mongod
  ```

  Or, specify a data directory:

  ```bash
  mkdir -p ~/data/db
  mongod --dbpath ~/data/db
  ```
- Verify MongoDB is running:

  ```bash
  mongosh
  db.runCommand({ ping: 1 })
  ```

  Expected output: `{ "ok": 1 }`.

### 3. Set Up the Backend

- Initialize the Node.js project (if not already done):

  ```bash
  npm init -y
  ```
- Install dependencies:

  ```bash
  npm install express mongoose jsonwebtoken cors axios
  ```
- Ensure `server.js` is configured with:

  ```javascript
  mongoose.connect('mongodb://localhost:27017/finmate')
  ```
- Run the backend:

  ```bash
  node server.js
  ```
- Expected output:

  ```
  Connected to MongoDB (finmate database)
  Server running on port 3000
  ```

### 4. Set Up the Frontend

- Install `live-server` to serve HTML files:

  ```bash
  npm install -g live-server
  ```
- Serve the frontend:

  ```bash
  live-server
  ```
- Open `http://127.0.0.1:8080/rec.html` in your browser.

### 5. Verify Setup

- Check the backend health endpoint:

  ```bash
  curl http://localhost:3000/health
  ```

  Expected response:

  ```json
  { "status": "OK", "message": "Server and MongoDB (finmate) are running" }
  ```
- In `mongosh`, after a login, check the `finmate` database:

  ```javascript
  use finmate
  db.users.find()
  ```

## Usage

1. **Start MongoDB**:

   ```bash
   mongod
   ```
2. **Run the Backend**:

   ```bash
   node server.js
   ```
3. **Serve the Frontend**:

   ```bash
   live-server
   ```
4. **Log In**:
   - Open `http://127.0.0.1:8080/rec.html`.
   - Enter a username (e.g., `testuser`) and password (e.g., `password123`).
   - Click "Login" to create a new user or log in.
   - On success, you’re redirected to `Dashboard.html`.
5. **Explore Features**:
   - Add transactions via `add-payment.html`.
   - Convert currencies via `currency-converter.html`.
   - Toggle dark/light mode using the theme button.

## Troubleshooting

- **MongoDB Connection Error** (`connect ECONNREFUSED`):
  - Ensure `mongod` is running: `mongod --dbpath ~/data/db`.
  - Verify `mongodb://localhost:27017/finmate` in `server.js`.
- **Port Conflict** (`EADDRINUSE: address already in use :::3000`):
  - Change the port in `server.js`:

    ```javascript
    const PORT = 3001;
    ```
  - Update `rec.html` fetch URLs:

    ```javascript
    fetch('http://localhost:3001/health')
    fetch('http://localhost:3001/api/auth/login')
    ```
  - Or kill the process:

    ```bash
    lsof -i :3000
    kill -9 <PID>
    ```
- **Unable to Connect to Server**:
  - Ensure `node server.js` is running.
  - Check `http://localhost:3000/health` in a browser.
  - Verify `rec.html` uses the correct port.
- **CORS Issues**:
  - Ensure `server.js` includes `app.use(cors())`.
- **Missing Dependencies**:
  - Run `npm install express mongoose jsonwebtoken cors axios`.
- **Dashboard.html 404**:
  - Create a placeholder `Dashboard.html` if missing:

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>FinMate Dashboard</title>
    </head>
    <body>
      <h1>Welcome to FinMate Dashboard</h1>
    </body>
    </html>
    ```

## Uploading to GitHub

1. **Initialize a Git Repository** (if not already done):

   ```bash
   git init
   ```
2. **Create a** `.gitignore` **File**:

   ```bash
   echo "node_modules/
   .env
   ~/data/db" > .gitignore
   ```
3. **Add Files**:

   ```bash
   git add .
   ```
4. **Commit Changes**:

   ```bash
   git commit -m "Initial commit of FinMate project"
   ```
5. **Create a GitHub Repository**:
   - Go to GitHub.
   - Create a repository named `finmate` (no need to initialize with README, `.gitignore`, or license).
6. **Link to Remote Repository**:

   ```bash
   git remote add origin https://github.com/your-username/finmate.git
   ```
7. **Push to GitHub**:

   ```bash
   git push -u origin main
   ```
8. **Verify**:
   - Visit `https://github.com/your-username/finmate` to see your files.

## Security Notes

- **Plaintext Passwords**: `server.js` stores passwords in plaintext for simplicity. For production, use `bcrypt`:

  ```bash
  npm install bcrypt
  ```

  Update `server.js` to hash passwords:

  ```javascript
  const bcrypt = require('bcrypt');
  userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  ```
- **Environment Variables**: Store sensitive data (e.g., JWT secret) in a `.env` file:

  ```bash
  echo "JWT_SECRET=your_jwt_secret" > .env
  npm install dotenv
  ```

  Update `server.js`:

  ```javascript
  require('dotenv').config();
  jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  ```

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.
