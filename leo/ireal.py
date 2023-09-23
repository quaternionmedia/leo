from typing import List

from pydantic import BaseModel
from pymongo import TEXT
from pyRealParser import Tune

from leo.db import db


class iReal(BaseModel):
    tune_string: str
    bpm: int
    chord_string: str
    comp_style: str
    composer: str
    key: str
    repeats: int | None
    style: str
    time_signature: List[int]
    title: str
    transpose: int | None


books = ['jazz', 'pop']


def initDB():
    db.songs.create_index([('title', TEXT), ('composer', TEXT), ('style', TEXT)])

    success = 0
    errors = 0
    for book_name in books:
        with open(f'{book_name}.ireal', 'r') as f:
            text = f.read()
            book = Tune.parse_ireal_url(text)
        for tune in book:
            try:
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
                        'tune_string': tune.tune_string,
                    }
                )
                success += 1
            except Exception as e:
                errors += 1
                print('error importing', tune, e)
    print(f'imported {success} tunes from {books} with {errors} errors')
