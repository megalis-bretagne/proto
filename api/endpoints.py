from .middlewares import login_required
from flask import Flask, json, g, request
from flask_cors import CORS
import requests, urllib
from requests.auth import HTTPBasicAuth


app = Flask(__name__, instance_relative_config=True)
CORS(app)

app.config.from_object('config')
u = app.config['PASTELL_USER']
p = app.config['PASTELL_PASSWORD']
root_url = app.config['PASTELL_URL']
PASTELL_ENTITIES = {}
#Store the link between user id and entity id
PASTELL_SESSIONS = {}

@app.route("/version", methods=["GET"])
@login_required
def version():
  ressource = '/version'
  PArequest = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
  data = json.loads(PArequest.text)
  return json_response({'pastel': data['version_complete']})


@app.route("/user", methods=["POST"])
@login_required
def user():
  global PASTELL_SESSIONS
  siren = False
  id_e = False
  organisme = False
  infos = {}
  mail = g.email
  params = request.get_json()
  if 'siren' in params.keys():
    siren = params['siren']
  else:
    return
  #Retreive user info (email) in jwt token with g (from middleware.py)
  # With this info, get more infos from Pastell API
  # We need siren code to filter entities

  if siren in PASTELL_ENTITIES.keys():
    id_e = PASTELL_ENTITIES[siren]['id_e']
    organisme = PASTELL_ENTITIES[siren]['denomination']
  else:
    print('L\'entité n\'existe pas')
    return

  # Get users from entity
  ressource = '/utilisateur/?id_e=%s' % id_e
  PArequest = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
  users = json.loads(PArequest.text)
  # Hack : Get user by email with doublons
  for index, usr in enumerate(users):
    #if usr["email"] == mail and usr["id_u"] != '11448':
    # Get first occurence of mail. Be carefull it may be many accounts with same mail
    if usr["email"] == mail:
      infos = usr
      id_u = infos['id_u']
      ressource2 = '/utilisateur/%s' % id_u
      request2 = requests.get(root_url + ressource2, auth=HTTPBasicAuth(u, p))
      current_user = json.loads(request2.text)
      current_user['organisme'] = organisme
      infos = current_user
      #STORE LOGIN INFOS iN SESSION
      if g.uid not in PASTELL_SESSIONS.keys():
        PASTELL_SESSIONS[g.uid] = {'user' : g.user, 'id_u': id_u, 'id_e': id_e, 'organisme': organisme }
      break


  return json_response({'user': g.user, 'details': infos})




@app.route("/document", methods=["POST", "GET"])
@app.route("/document/<string:id_doc>", methods=["POST","PATCH"])
@app.route("/document/<string:id_doc>/action/<string:id_action>", methods=["POST"])
@login_required
def document(id_doc=None, element=None, field=None, id_action=None):
  if g.uid in PASTELL_SESSIONS.keys():
    print (PASTELL_SESSIONS[g.uid])
  else:
    print('Infos manquantes : id_e')
    return json_response([])
  if request.method == 'GET':
    #TODO THIS replace 1 by correct id_e
    ressource = '/entite/%s/document' % PASTELL_SESSIONS[g.uid]['id_e']
    PA_request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    return json_response(data)

  elif request.method == 'POST' and id_doc is None:
    # CREATE NEw doc
    ressource = '/entite/%s/document' % PASTELL_SESSIONS[g.uid]['id_e']
    params = request.get_json()
    PA_request = requests.post(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    return json_response({'pastel': data})

  elif request.method == 'POST' and id_doc and id_action:
    ressource = '/entite/%s/document/%s/action/%s' % (PASTELL_SESSIONS[g.uid]['id_e'], id_doc, id_action)
    PA_request = requests.post(root_url + ressource, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    return json_response({'action': data})

  elif request.method == 'PATCH':
    ressource = '/entite/%s/document/%s' % (PASTELL_SESSIONS[g.uid]['id_e'],id_doc)
    params = request.get_json()
    print (params)
    PA_request = requests.patch(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    print(PA_request.text)
    data = json.loads(PA_request.text)
    return json_response({'pastel': data})

@app.route("/document/<string:id_doc>/file/<string:element>", methods=["POST"])
@login_required
def addFile(id_doc, element):
  if request.method == 'POST' and id_doc and element:
    # AJOUT Fichier
    ressource = '/entite/%s/document/%s/file/%s' % (PASTELL_SESSIONS[g.uid]['id_e'], id_doc, element)
    if 'file_content' in request.files:
      fileStorage = request.files['file_content']
      filename = fileStorage.filename
      file=request.files['file_content'].read()
      PA_request = requests.post(root_url + ressource, files={'file_content': file}, data = { "file_name": filename}, auth=HTTPBasicAuth(u, p))
      data = json.loads(PA_request.text)
      return json_response({'pastel': data})


@app.route("/document/<string:id_doc>/externalData/<string:field>", methods=["GET"])
@login_required
def externalData(id_doc, field):
  #ExternaData
  ressource = '/entite/%s/document/%s/externalData/%s' % (PASTELL_SESSIONS[g.uid]['id_e'], id_doc, field)
  request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
  data = json.loads(request.text)
  return json_response({'externalData': { field: data}})



def json_response(payload, status=200):
 return (json.dumps(payload), status, {'content-type': 'application/json'})


def getAllPastellEntities():
  global PASTELL_ENTITIES
  ressource = '/entite'
  request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
  data = json.loads(request.text)
  for index, entity in enumerate(data):
    e = entity['siren']
    # Keep only entites mere + Hack Z_TEST_MEGALIS
    if entity['entite_mere'] == '0' and entity['id_e'] != '2177':
      PASTELL_ENTITIES[e] = entity

  print("Referentiel des entités chargé")

getAllPastellEntities()

