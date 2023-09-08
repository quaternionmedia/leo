from pymongo import TEXT
from pyRealParser import Tune

from leo.db import db


def initDB():
    db.songs.create_index([('title', TEXT), ('composer', TEXT), ('style', TEXT)])

    for book_name in ['pop']:
        with open(f'{book_name}.ireal', 'r') as f:
            text = f.read()
            book = Tune.parse_ireal_url(text)
        for tune in book:
            db.songs.insert_one(
                {
                    'book': book_name,
                    'bpm': int(tune.bpm),
                    'chord_string': tune.chord_string,
                    'comp_style': tune.comp_style,
                    'composer': tune.composer,
                    'key': tune.key,
                    'repeats': tune.repeats,
                    'style': tune.style,
                    'time_signature': tune.time_signature,
                    'title': tune.title,
                    'transpose': tune.transpose,
                }
            )