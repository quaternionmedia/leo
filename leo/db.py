from pymongo import MongoClient

from leo.config import DB_URL

client = MongoClient(DB_URL, connect=False)
db = client.leo
