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
