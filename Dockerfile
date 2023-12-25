FROM node:lts-alpine

WORKDIR /app 

# It copies NASA_FS to /app (workdir)
COPY package*.json ./

#It install package.json and package lock.json
COPY client/package*.json client/
RUN npm run install-client --omit=dev

COPY server/package*.json server/
RUN npm run install-server --omit=dev

COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/

USER node

CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8000