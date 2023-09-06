FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7-alpine3.8
EXPOSE 8000
RUN apk add python3-dev gcc make libc-dev
RUN pip install -U pip
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

WORKDIR /app
ENTRYPOINT ["/start-reload.sh"]
