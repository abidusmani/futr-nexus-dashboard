# === Stage 1: Build the React App ===
# Use a Node.js image to build the app
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies securely and efficiently
RUN npm ci

# Copy the rest of the project source code
COPY . .

# Run the build script (which creates the 'dist' folder)
RUN npm run build


# === Stage 2: Serve the App with Nginx ===
# Use a lightweight Nginx image for the final container
FROM nginx:1.25-alpine

# Set the port
EXPOSE 80

# Copy the build output (your 'dist' folder) from the 'builder' stage
# This is the crucial part for a Vite project
COPY --from=builder /app/dist /usr/share/nginx/html

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]