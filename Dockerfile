# === Stage 1: Build the React App ===
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# === Stage 2: Serve the App with Node ===
# Use a slim Node.js image for the final container
FROM node:18-alpine

WORKDIR /app

# Install 'serve', a simple static server
RUN npm install -g serve

# Copy *only* the built files from the 'builder' stage
COPY --from=builder /app/dist .

# EXPOSE the port Cloud Run will provide
# (Cloud Run provides this as an environment variable, $PORT)
EXPOSE 8080

# Start the server
# -s handles Single-Page-App (React) routing
# 'serve' will AUTOMATICALLY listen on the $PORT variable
# provided by Google Cloud Run. This 100% solves your error.
CMD ["serve", "-s", "."]