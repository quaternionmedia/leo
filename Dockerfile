FROM node:alpine
WORKDIR /app

RUN yarn global add parcel

EXPOSE 1234

CMD ["parcel", "watch", "--hmr-port=1234", "/app/src/*"]
