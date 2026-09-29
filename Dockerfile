FROM node:24-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache layers
COPY package*.json ./

RUN npm install

# Next line is optional in development. As docker compose will bind-mount 
# them dynamically for live reloading.
COPY . .

EXPOSE 7080

CMD ["npm", "run", "dev"]
