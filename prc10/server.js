const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Route to display logs
app.get("/logs", (req, res) => {
  const logFilePath = path.join(__dirname, "logs", "errors.log");

  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading log file:", err.message);
      return res
        .status(500)
        .send("<h1>Error: Could not read log file</h1><p>" + err.message + "</p>");
    }

    // Replace newlines with <br> for HTML display
    const formattedLogs = data.replace(/\n/g, "<br>");

    res.send(`
      <html>
        <head>
          <title>Log Viewer</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            h1 { color: #333; }
            .logs { background: #fff; padding: 15px; border-radius: 8px; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
                    font-family: monospace; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Server Logs</h1>
          <div class="logs">${formattedLogs}</div>
        </body>
      </html>
    `);
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("<h2>Welcome! Visit <a href='/logs'>/logs</a> to view logs</h2>");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});