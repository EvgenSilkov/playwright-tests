FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /pw-test

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm ci --ignore-scripts
RUN npx playwright install chrome

COPY . .

CMD  ["npm", "run", "stage"]