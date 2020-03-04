from pyRealParser import Tune
from pymongo import MongoClient

client = MongoClient('mongodb://mongo:27017', connect=False)
db = client.leo

def initDB():
    with open('jazz.ireal', 'r') as f:
        jazz = f.read()
        book = Tune.parse_ireal_url(jazz)
    for tune in book:
        db.songs.insert_one({
            'bpm': tune.bpm,
            'chord_string': tune.chord_string,
            'comp_style': tune.comp_style,
            'composer': tune.composer,
            'key': tune.key,
            'repeats': tune.repeats,
            'style': tune.style,
            'time_signature': tune.time_signature,
            'title': tune.title,
            'transpose': tune.transpose,
            })
