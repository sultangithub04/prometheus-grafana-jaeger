
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY instrumentation.mjs ./

EXPOSE 3000

CMD ["node", "--import", "./instrumentation.mjs", "src/server.js"]
