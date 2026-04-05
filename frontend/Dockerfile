FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]
