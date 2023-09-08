import os
from csv import reader


def setlist():
    with open('setlist.csv') as f:
        setlist = reader(f.readlines())

    return [song[1] for song in setlist]
