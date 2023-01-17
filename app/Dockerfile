FROM node:18-alpine
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json .
RUN npm install
COPY . .
RUN yarn build
EXPOSE 30000
CMD ["npm","start"]