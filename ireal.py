from urllib.parse import unquote
from pyRealParser import Tune

with open('jazz.ireal', 'r') as f:
    jazz = f.read()
book = Tune.parse_ireal_url(jazz)
