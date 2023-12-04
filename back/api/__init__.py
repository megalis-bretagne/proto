from functools import wraps
from flask import request, g
from jwt import decode, exceptions
import json


import logging
from flask_cors import CORS
from flask import Flask

PASTELL_ENTITIES = {}
# Store the link between user id and entity id
PASTELL_SESSIONS = {}

def create_app():
    logging.basicConfig(
        format="%(asctime)s.%(msecs)03d : %(levelname)s : %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    app = Flask(__name__, instance_relative_config=True)
    CORS(app, resources={r"*": {"origins": "*"}})

    app.config.from_object('back.config.config')
    with app.app_context():
        from back.api import endpoints
    # u = app.config['PASTELL_USER']
    # p = app.config['PASTELL_PASSWORD']
    # restricted_roles = app.config['RESTRITED_ROLES']
    # root_url = app.config['PASTELL_URL']
    return app
def login_required(f):

   @wraps(f)
   def wrap(*args, **kwargs):
       authorization = request.headers.get("authorization", None)
       if not authorization:
           return json.dumps({'error': 'no authorization token provided'}), 401, {'Content-type': 'application/json'}

       try:
           token = authorization.split(' ')[1]
           resp = decode(token, None, verify=False, algorithms=['HS256'])
           g.user = resp['name']
           g.username = resp['preferred_username']
           g.email = resp['email']
           g.uid = resp['uid']

       except exceptions.DecodeError as identifier:
           return json.dumps({'error': 'invalid authorization token'}), 401, {'Content-type': 'application/json'}

       return f(*args, **kwargs)

   return wrap