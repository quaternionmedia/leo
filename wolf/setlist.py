setlist = []

import os
path = '.'

for dpath, subdirs, files in os.walk(path):
    for x in files:
        if x.endswith('.pdf') == True:
            setlist.append(os.path.join(path, x))
