from os import path

from fastapi import Body, FastAPI, Path
from starlette.responses import RedirectResponse

# from pymongo import MongoClient
from starlette.staticfiles import StaticFiles

from leo.db import db
from leo.setlist import setlist

# client = MongoClient('mongodb://mongo:27017', connect=False)
# db = client.leo

app = FastAPI()


@app.get('/setlist')
def getSetlist():
    return ['test'] + setlist()


@app.get('/songs')
def getSongs(s: str = ''):
    return [i['title'] for i in db.songs.find({'$text': {'$search': s}})]


@app.get('/song/{song}')
def getSong(song: str = ''):
    song_path = f'pdf/{song}.pdf'
    if path.exists(song_path):
        return song_path
    return db.songs.find_one({'title': song})


@app.get('/annotations/{song}')
def getAnnotations(song: str = Path(..., title='name of song')):
    results = db.annotations.find_one({'song': song})
    print('got annotations!')
    print(results)
    if results:
        return results['annotations']


@app.post('/annotations/{song}')
def postAnnotations(
    *, annotations=Body(...), song: str = Path(..., title='name of song')
):
    print('saved annotations!', song, annotations)
    res = db.annotations.update(
        {'song': song}, {'$set': {'annotations': annotations}}, upsert=True
    )
    print('saved! ', res)


app.mount("/pdf", StaticFiles(directory='pdf'))
app.mount("/", StaticFiles(directory='dist', html=True), name="static")
