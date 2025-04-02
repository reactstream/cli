FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY .. .

# Install global dependencies
RUN npm install -g @babel/core @babel/preset-env @babel/preset-react eslint

# Build the application
RUN npm run build

# Expose ports for the web interface and development server
EXPOSE 80 3000

# Start the application
CMD ["npm", "start"]
