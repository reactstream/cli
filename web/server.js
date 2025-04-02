const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Temporary file storage
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Handle code analysis request
  socket.on('analyze-code', (code) => {
    const tempFile = path.join(TEMP_DIR, `component-${Date.now()}.jsx`);

    // Save code to temporary file
    fs.writeFileSync(tempFile, code);

    // Run ReactStream analyze command
    exec(`reactstream analyze ${tempFile} --verbose`, (error, stdout, stderr) => {
      socket.emit('analysis-result', {
        output: stdout,
        error: stderr || (error ? error.message : null)
      });

      // Clean up temp file
      fs.unlinkSync(tempFile);
    });
  });

  // Handle component preview request
  socket.on('preview-component', (code) => {
    const tempFile = path.join(TEMP_DIR, `component-${Date.now()}.jsx`);

    // Save code to temporary file
    fs.writeFileSync(tempFile, code);

    // Run ReactStream serve command (non-blocking)
    const serveProcess = exec(`reactstream serve ${tempFile} --port=3000`);

    serveProcess.stdout.on('data', (data) => {
      socket.emit('serve-output', { type: 'stdout', data });
    });

    serveProcess.stderr.on('data', (data) => {
      socket.emit('serve-output', { type: 'stderr', data });
    });

    socket.on('disconnect', () => {
      serveProcess.kill();
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    });
  });
});

// API routes
app.post('/api/analyze', (req, res) => {
  const { code } = req.body;
  const tempFile = path.join(TEMP_DIR, `component-${Date.now()}.jsx`);

  fs.writeFileSync(tempFile, code);

  exec(`reactstream analyze ${tempFile} --verbose`, (error, stdout, stderr) => {
    res.json({
      output: stdout,
      error: stderr || (error ? error.message : null)
    });

    fs.unlinkSync(tempFile);
  });
});

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
