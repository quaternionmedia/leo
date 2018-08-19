FROM harpo1224/alpy

RUN pip install autobahn[asyncio] pymongo retry

COPY ./wolf.py /wolf/wolf.py
ENTRYPOINT ["python3", "-u", "/wolf/wolf.py"]
