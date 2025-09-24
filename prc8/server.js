const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Read counter value from file
function readCounter() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data).count;
}

// Write counter value to file
function writeCounter(count) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count }));
}

// Get current counter
app.get('/counter', (req, res) => {
  const count = readCounter();
  res.json({ count });
});

// Update counter
app.post('/counter', (req, res) => {
  let count = readCounter();
  const { action } = req.body;

  if (action === 'increment') count++;
  else if (action === 'decrement') count--;
  else if (action === 'reset') count = 0;

  writeCounter(count);
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});