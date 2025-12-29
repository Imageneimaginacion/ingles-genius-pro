import os
import sys

# Insert current directory to python path
sys.path.insert(0, os.path.dirname(__file__))

# Import a2wsgi to convert ASGI (FastAPI) to WSGI (cPanel/Passenger)
from a2wsgi import ASGIMiddleware
from main import app

# Create the WSGI application
application = ASGIMiddleware(app)
