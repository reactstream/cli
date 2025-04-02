const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Temporary file storage
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// Logs directory
const LOGS_DIR = process.env.LOGS_DIR || path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Handle code analysis request
  socket.on('analyze-code', (code) => {
    const tempFile = path.join(TEMP_DIR, `component-${Date.now()}.jsx`);

    // Save code to temporary file
    fs.writeFileSync(tempFile, code);

    // Build command with environment variables
    const analyzeCommand = `reactstream analyze ${tempFile} ${
        process.env.VERBOSE_OUTPUT === 'true' ? '--verbose' : ''
    } ${
        process.env.AUTO_FIX === 'true' ? '--fix' : ''
    } ${
        process.env.ENABLE_DEBUG === 'true' ? '--debug' : ''
    }`;

    // Run ReactStream analyze command
    exec(analyzeCommand, (error, stdout, stderr) => {
      socket.emit('analysis-result', {
        output: stdout,
        error: stderr || (error ? error.message : null)
      });

      // Log analysis results
      const timestamp = new Date().toISOString();
      fs.appendFileSync(
          path.join(LOGS_DIR, 'analysis.log'),
          `[${timestamp}] Analysis performed\n${stdout}\n${stderr || ''}\n\n`
      );

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
    const serveProcess = exec(
        `reactstream serve ${tempFile} --port=${process.env.DEV_SERVER_PORT || 3000}`
    );

    serveProcess.stdout.on('data', (data) => {
      socket.emit('serve-output', { type: 'stdout', data });

      // Log serve output
      const timestamp = new Date().toISOString();
      fs.appendFileSync(
          path.join(LOGS_DIR, 'serve.log'),
          `[${timestamp}] STDOUT: ${data}\n`
      );
    });

    serveProcess.stderr.on('data', (data) => {
      socket.emit('serve-output', { type: 'stderr', data });

      // Log serve errors
      const timestamp = new Date().toISOString();
      fs.appendFileSync(
          path.join(LOGS_DIR, 'serve.log'),
          `[${timestamp}] STDERR: ${data}\n`
      );
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

  // Build command with environment variables
  const analyzeCommand = `reactstream analyze ${tempFile} ${
      process.env.VERBOSE_OUTPUT === 'true' ? '--verbose' : ''
  } ${
      process.env.AUTO_FIX === 'true' ? '--fix' : ''
  } ${
      process.env.ENABLE_DEBUG === 'true' ? '--debug' : ''
  }`;

  exec(analyzeCommand, (error, stdout, stderr) => {
    res.json({
      output: stdout,
      error: stderr || (error ? error.message : null)
    });

    fs.unlinkSync(tempFile);
  });
});

// Add this to server.js in the API routes section
app.get('/api/config', (req, res) => {
  res.json({
    devServerPort: process.env.DEV_SERVER_PORT || 3000,
    debug: process.env.ENABLE_DEBUG === 'true',
    autoFix: process.env.AUTO_FIX === 'true',
    verbose: process.env.VERBOSE_OUTPUT === 'true'
  });
});


// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.SERVER_PORT || 80;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Dev server port: ${process.env.DEV_SERVER_PORT || 3000}`);
});
