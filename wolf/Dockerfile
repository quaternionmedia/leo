FROM harpo1224/alpy

RUN pip install autobahn[asyncio] pymongo retry

COPY . /wolf/
ENTRYPOINT ["python3", "-u", "/wolf/wolf.py"]
