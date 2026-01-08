from os import getenv


DB_URL = getenv('LEO_DB_URL', 'mongodb://mongo:27017')
