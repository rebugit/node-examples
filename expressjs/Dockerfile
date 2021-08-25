FROM node
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm install

COPY db.js /app/db.js
COPY server.js /app/server.js
COPY repository.js /app/repository.js
COPY controller.js /app/controller.js

EXPOSE 8080

CMD ["node", "server.js"]
