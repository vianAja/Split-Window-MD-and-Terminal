FROM node:18-bullseye
WORKDIR /app

COPY package*.json ./

# tambahin deps buat build native module
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

RUN npm install --omit=dev

COPY . .

# Rebuild biar cocok sama Node di container
RUN npm rebuild node-pty

#CMD ["npm", "start"]
CMD ["node", "server.js"]