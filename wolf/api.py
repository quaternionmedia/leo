from fastapi import FastAPI, Path, Body
from starlette.staticfiles import StaticFiles
from uvicorn import run
from setlist import setlist
from pymongo import MongoClient
client = MongoClient('mongodb://mongo:27017', connect=False)
db = client.leo

app = FastAPI()

@app.get('/setlist')
def getSetlist():
    return setlist('pdf')

@app.get('/annotations/{song}')
def getAnnotations(song: str = Path(..., title='name of song')):
    results = db.annotations.find_one({'song': song})
    print('got annotations!')
    print(results)
    if results:
        return results['annotations']

@app.post('/annotations/{song}')
def postAnnotations(*, annotations=Body(...), song: str = Path(..., title='name of song')):
    print('saved annotations!', song, annotations)
    res = db.annotations.update({ 'song': song }, { '$set': {'annotations': annotations} }, upsert=True)
    print('saved! ', res)

app.mount("/pdf", StaticFiles(directory='pdf'))
app.mount("/", StaticFiles(directory='dist', html=True), name="static")
if __name__ == '__main__':
    run(app, host='0.0.0.0')
