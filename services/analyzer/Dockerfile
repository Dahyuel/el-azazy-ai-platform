FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    unrar-free \
    p7zip-full \
    unzip \
    poppler-utils \
    libreoffice-writer \
    libreoffice-impress \
    libreoffice-calc \
    fonts-noto \
    fonts-dejavu \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python tools for Pinterest + Google Drive
RUN pip3 install --break-system-packages pinterest-dl gdown || \
    pip3 install pinterest-dl gdown

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY . .

EXPOSE 3456
CMD ["node", "server.js"]
