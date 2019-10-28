FROM countable/parceljs

EXPOSE 1234
WORKDIR /app

CMD ["parcel", "watch", "/app/src/*"]
