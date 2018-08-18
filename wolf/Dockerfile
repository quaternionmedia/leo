FROM harpo1224/alpy

RUN pip install autobahn[asyncio] pymongo

COPY ./wolf.py /wolf.py
ENTRYPOINT ["python3", "/wolf.py"]
