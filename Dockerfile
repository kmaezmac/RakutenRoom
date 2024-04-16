FROM ghcr.io/puppeteer/puppeteer:19.7.2

USER root

# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -

RUN curl https://dl.google.com/linux/linux_signing_key.pub |  apt-key add - echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list
        # sudo apt update
        # sudo apt install google-chrome-stable

RUN apt-get update && \
    apt-get install -y xvfb

USER node

ENV DISPLAY=:99

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

# Start xvfb and run the application
CMD xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" npx nodemon app.js