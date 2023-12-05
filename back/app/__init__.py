from functools import wraps
from flask import request, g, Flask
from jwt import decode, exceptions
import json
import yaml
import logging
from flask_cors import CORS

PASTELL_ENTITIES = {}
# Store the link between user id and entity id
PASTELL_SESSIONS = {}


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

def create_app(config_file = "config/config.yml"):
    logging.basicConfig(
        format="%(asctime)s.%(msecs)03d : %(levelname)s : %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    app = Flask(__name__)
    CORS(app, resources={r"*": {"origins": "*"}})
    read_config(app, config_file)
    return app


def read_config(app, config_file):
    try:
        with open(config_file) as yamlfile:
            config_data = yaml.load(yamlfile, Loader=yaml.FullLoader)
    except Exception:
        config_data = {}
    # Load common settings
    app.config.update(config_data)

app = create_app()
with app.app_context():
    from . import endpoints
def app_base():
    return app

# TODO passer à fast API
