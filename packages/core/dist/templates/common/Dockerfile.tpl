# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 3000, but you can change this
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ]