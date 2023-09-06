from api import app

if __name__ == '__main__':
    from uvicorn import run

    run(app, host='0.0.0.0', port=80)
