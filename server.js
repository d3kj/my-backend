const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3111;

app.use(cors({
  origin: 'https://lolak.netlify.app' // your frontend URL
}));

app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const KEYS_FILE = path.join(__dirname, 'keys.txt');  // list of valid keys (one per line)
const USED_KEYS_FILE = path.join(__dirname, 'usedKeys.json');

// Load users from file or initialize empty object
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
// Save users to file
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Load used keys or initialize empty array
function loadUsedKeys() {
  if (!fs.existsSync(USED_KEYS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USED_KEYS_FILE, 'utf8'));
}
// Save used keys
function saveUsedKeys(keys) {
  fs.writeFileSync(USED_KEYS_FILE, JSON.stringify(keys, null, 2));
}

// Load valid keys once at server start
const validKeys = fs.existsSync(KEYS_FILE) ? 
  fs.readFileSync(KEYS_FILE, 'utf8').split('\n').map(k => k.trim()).filter(k => k) : [];

app.post('/signup', async (req, res) => {
  const { username, password, key } = req.body;

  if (!username || !password || !key) {
    return res.status(400).json({ error: 'Username, password and key required' });
  }

  if (!validKeys.includes(key)) {
    return res.status(400).json({ error: 'Invalid signup key' });
  }

  const usedKeys = loadUsedKeys();
  if (usedKeys.includes(key)) {
    return res.status(400).json({ error: 'Signup key already used' });
  }

  let users = loadUsers();
  if (users[username]) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    saveUsers(users);

    usedKeys.push(key);
    saveUsedKeys(usedKeys);

    return res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = loadUsers();
  if (!users[username]) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }

  try {
    const match = await bcrypt.compare(password, users[username].password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    return res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
