FROM node:alpine
WORKDIR /app

RUN yarn global add vite

EXPOSE 1234

# CMD ["parcel", "watch", "--hmr-port=1234", "/app/src/*"]
