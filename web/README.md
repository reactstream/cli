# ReactStream Web Interface

A web-based interface for ReactStream that provides an interactive environment for React component development, testing, and analysis. Similar to playcode.io, it features a 4-panel layout with code editor, component preview, analysis results, and console output.

![ReactStream Web Interface](img/reactstream-screenshot.png)

## Features

- **Interactive Code Editor** - Monaco-based editor with syntax highlighting and code completion
- **Live Component Preview** - Real-time rendering of your React components
- **Component Analysis** - Analyze your components for best practices and potential issues
- **Console Output** - View logs, errors, and warnings in real-time

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v14 or higher) and npm (for local development)

### Quick Start with Docker

1. Clone the repository:

```bash
git clone https://github.com/reactstream/web.git
cd web
```

2. Start the application using Docker Compose:

```bash
docker-compose up -d
```

3. Access the application in your browser:
   - Open [http://localhost](http://localhost) or [http://www.reactstream.com](http://www.reactstream.com) (if you've configured your hosts file)


### Local Development Setup

Install dependencies:

```bash
npm install
```

Build the frontend:

```bash
npm run build
```

Start the server:

```bash
npm start
```

5. Access the application in your browser:
   - Open [http://localhost:80](http://localhost:80)

## Project Structure

```
reactstream-web/
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── package.json             # Node.js dependencies and scripts
├── webpack.config.js        # Webpack configuration
├── server.js                # Express server handling API and socket.io
├── src/                     # Frontend source code
│   ├── index.html           # Main HTML template
│   ├── index.js             # React entry point
│   ├── App.js               # Main React component
│   ├── styles.css           # Global styles
│   └── components/          # React components
│       ├── Editor.js        # Code editor component
│       ├── Preview.js       # Component preview panel
│       ├── Analysis.js      # Analysis results panel
│       └── Console.js       # Console output panel
├── temp/                    # Temporary storage for component files
└── dist/                    # Built frontend files (generated)
```

## Usage

1. **Write or paste your React component code** in the editor panel
2. **Click "Analyze"** to check your component for issues and best practices
3. **Click "Run"** to see your component rendered in the preview panel
4. **View console output** for logs, errors, and warnings

## Domain Configuration

To use the custom domain (www.reactstream.com):

1. Add an entry to your hosts file:

```bash
# On Linux/Mac
sudo nano /etc/hosts

# On Windows
# Edit C:\Windows\System32\drivers\etc\hosts as administrator
```

2. Add the following line:

```
127.0.0.1 www.reactstream.com
```

3. Save the file and restart your browser

## Development

### Building the Frontend

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - If port 80 or 3000 is already in use, modify the port mappings in docker-compose.yml

2. **Docker permission issues**
   - Run Docker commands with sudo on Linux or ensure your user is in the docker group

3. **Node modules issues**
   - Try deleting node_modules folder and package-lock.json, then run npm install again

4. **Preview not loading**
   - Check if the development server is running on port 3000
   - Check browser console for CORS errors

5. **Analysis not working**
   - Ensure ReactStream CLI is properly installed in the Docker container
   - Check server logs for execution errors

## Quick Commands Reference

```bash
# Start with Docker
docker-compose up -d

# Stop Docker containers
docker-compose down

# View logs
docker-compose logs -f

# Install dependencies
npm install

# Build frontend
npm run build

# Start server
npm start

# Development mode
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ReactStream](https://github.com/reactstream/cli) - The CLI tool that powers the analysis and component serving
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [Socket.IO](https://socket.io/) - For real-time communication between client and server
- [Express](https://expressjs.com/) - Web server framework
- [React](https://reactjs.org/) - UI library
