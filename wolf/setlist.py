import os

def setlist(path):
    setlist = []
    for dpath, subdirs, files in os.walk(path):
        for x in files:
            if x.endswith('.pdf'):
                # setlist.append(os.path.join(path, x))
                setlist.append(x)
    return setlist
