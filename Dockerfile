FROM node:24-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache layers
COPY package*.json ./

RUN npm install

# We don't COPY the rest of the files here because we will bind-mount 
# them dynamically in the docker-compose file for live reloading.

EXPOSE 7080

CMD ["npm", "run", "dev"]
