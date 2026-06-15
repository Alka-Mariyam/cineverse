# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5173 (Vite's default port)
EXPOSE 5173

# Start the Vite development server with host tracking so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
