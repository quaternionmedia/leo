FROM harpo1224/alpy
EXPOSE 8000
RUN apk add python3-dev gcc make libc-dev
RUN pip install -U pip
RUN pip install fastapi[all] uvicorn
# COPY . /wolf/
WORKDIR /wolf
ENTRYPOINT ["python3", "-u", "/wolf/api.py"]
