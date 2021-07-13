FROM node:12

# Install deps + add Chrome Stable + purge all the things
RUN apt update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl unzip \
    default-jre \
    gnupg --no-install-recommends

# Add app and install dependencies
WORKDIR /app

COPY . .

RUN npm install
