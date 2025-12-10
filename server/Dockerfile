# Use a specific, lightweight Node.js version
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# 1. Copy ONLY package definition files first (for optimal caching)
COPY package.json pnpm-lock.yaml ./

# 2. Install dependencies using pnpm (clean, reproducible install)
RUN npm install -g pnpm@latest && pnpm install --frozen-lockfile --prod

# 3. Copy the rest of the application source code
COPY . .

# 4. Your application listens on port 3000
EXPOSE 3000

# 5. Start the application (assuming your main file is server.js)
CMD ["node", "server.js"]