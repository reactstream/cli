FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Install global dependencies
RUN npm install -g @babel/core @babel/preset-env @babel/preset-react eslint

# Create necessary directories
RUN mkdir -p temp logs components

# Build the application
RUN npm run build

# Expose ports for the web interface and development server
# These will be overridden by the environment variables
EXPOSE 80 3000

# Start the application
CMD ["node", "server.js"]
