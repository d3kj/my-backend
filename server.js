const express = require("express");
const fs = require("fs");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

const USERS_FILE = "users.json";
const KEYS_URL = "https://raw.githubusercontent.com/d3kj/sdqsdqdqsdsssssssss/refs/heads/main/synapse%20x%20keys.txt";

app.use(cors());
app.use(express.json());

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: {}, usedKeys: [] }));
}

// Read JSON safely
function readUsers() {
  const data = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(data);
}

// Write JSON safely
function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

app.post("/signup", async (req, res) => {
  const { username, password, key } = req.body;
  if (!username || !password || !key) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const userData = readUsers();
  if (userData.users[username]) {
    return res.status(409).json({ error: "Username already exists" });
  }

  if (userData.usedKeys.includes(key)) {
    return res.status(403).json({ error: "Key already used" });
  }

  try {
    const response = await fetch(KEYS_URL);
    const text = await response.text();
    const keys = text.split("\n").map(k => k.trim());
    if (!keys.includes(key)) {
      return res.status(403).json({ error: "Invalid key" });
    }
  } catch {
    return res.status(500).json({ error: "Failed to verify key" });
  }

  userData.users[username] = password;
  userData.usedKeys.push(key);
  writeUsers(userData);
  return res.json({ message: "Signup successful" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const userData = readUsers();

  if (userData.users[username] === password) {
    return res.json({ message: "Login successful" });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
