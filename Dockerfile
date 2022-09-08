FROM node:alpine
WORKDIR /app

RUN yarn global add parcel

COPY ./package.json .
RUN yarn install

EXPOSE 1234
EXPOSE 1235

CMD ["parcel", "watch", "--hmr-port=1235", "/app/src/*"]
