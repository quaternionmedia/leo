from os import path
from urllib.parse import quote

from fastapi import Body, FastAPI, HTTPException, Path
from starlette.staticfiles import StaticFiles

from leo.db import db
from leo.ireal import iReal
from leo.setlist import setlist

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
    if db.songs.find_one({'title': song}):
        return f'ireal/{song}'
    raise HTTPException(status_code=404, detail='Song not found')


@app.get('/ireal/{song}')
def getIreal(song: str):
    result = dict(db.songs.find_one({'title': song}))
    result.pop('_id')
    real = iReal(**result)
    tune = real.tune_string
    print('got ireal!', tune)
    return f'irealb://{quote(tune)}===LeoBook'


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
