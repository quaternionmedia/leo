from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
from uvicorn import run
from setlist import setlist

app = FastAPI()

@app.get('/setlist')
def getSetlist():
    return setlist
app.mount("/pdf", StaticFiles(directory='web/pdf'))
app.mount("/", StaticFiles(directory='dist', html=True), name="static")
if __name__ == '__main__':
    run(app, host='0.0.0.0')
