from pymongo import TEXT, MongoClient

client = MongoClient('mongodb://mongo:27017', connect=False)
db = client.leo

db.songs.create_index([('title', TEXT), ('composer', TEXT), ('style', TEXT)])
