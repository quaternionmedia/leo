from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
from uvicorn import run

app = FastAPI()

app.mount("/pdf", StaticFiles(directory='web/pdf'))
app.mount("/", StaticFiles(directory='dist', html=True), name="static")
if __name__ == '__main__':
    run(app)
