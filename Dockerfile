FROM node:alpine
WORKDIR /app

ENV PATH=node_modules/.bin/:$PATH

EXPOSE 1234

CMD ["npm", "run", "dev"]
