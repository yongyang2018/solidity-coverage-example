FROM node:14-alpine
ENV PORT 3000
ENV GANACHE_CONFIG ''
RUN mkdir -p /app
WORKDIR /app
ADD . /app

# keep the solidity compiler cached in the image
RUN npm run compile 
EXPOSE 3000
ENTRYPOINT [ "npm", "run", "ganache"]