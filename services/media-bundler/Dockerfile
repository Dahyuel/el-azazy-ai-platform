FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    unrar-free \
    p7zip-full \
    unzip \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Drive download (same as analyzer-service)
RUN pip3 install --break-system-packages gdown || pip3 install gdown

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY . .

RUN mkdir -p /data/zips

EXPOSE 3000
CMD ["node", "server.js"]
