# Use a standard Node.js LTS image
FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
# Using 'npm ci' with '--omit=dev' ensures a clean, production-only install
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of your application code
COPY . .

# Use a non-root user for better security (optional but recommended)
USER node

# Run the app
CMD ["node", "app.js"]