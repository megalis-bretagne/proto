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
  #PASTELL SESSIONS ARE REINITIALIZED AT EACH API RESTART
  global PASTELL_SESSIONS
  if g.uid not in PASTELL_SESSIONS.keys():
    siren = False
    id_e = False
    organisme = False
    infos = {}
    username = g.username
    params = request.get_json()
    if 'siren' in params.keys():
      siren = params['siren']
    else:
      return json_response({"erreur": "Le SIREN est inconnu"})
    #Retreive user info (username) in jwt token with g (from middleware.py)
    # With this info, get more infos from Pastell API
    # First We need siren code to filter entities. THen we keep the id_e and
    # request all users for this entity then filter this user list to find this username

    if siren in PASTELL_ENTITIES.keys():
      id_e = PASTELL_ENTITIES[siren]['id_e']
      organisme = PASTELL_ENTITIES[siren]['denomination']
    else:
      print('L\'entité n\'existe pas')
      return json_response({"erreur": "L'entité n'existe pas"})

    # Get users from entity filtered
    ressource = '/utilisateur/?id_e=%s' % id_e
    PArequest = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
    users = json.loads(PArequest.text)
    # Hack : Get user by Pastell login = username in sso keycloak
    for index, usr in enumerate(users):
      #if usr["login"] == username
      # Get first occurence of username.
      if usr["login"] == username:
        infos = usr
        id_u = infos['id_u']
        ressource2 = '/utilisateur/%s' % id_u
        request2 = requests.get(root_url + ressource2, auth=HTTPBasicAuth(u, p))
        current_user = json.loads(request2.text)
        current_user['organisme'] = organisme
        ressource3 = '/utilisateur/%s/role' % id_u
        request3 = requests.get(root_url + ressource3, auth=HTTPBasicAuth(u, p))
        current_user['roles'] = json.loads(request3.text)
        infos = current_user
        #STORE TEMPORALY LOGIN INFOS iN SESSION
        PASTELL_SESSIONS[g.uid] = {'user': g.user, 'details': infos}
        break

  response = { "erreur" : "utilisateur %s non trouvé dans Pastell " % g.username}
  if g.uid in PASTELL_SESSIONS.keys():
    response = PASTELL_SESSIONS[g.uid]
  return json_response(response)




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
  IDE = PASTELL_SESSIONS[g.uid]['details']['id_e']
  if request.method == 'GET':
    ressource = '/entite/%s/document' % IDE
    PA_request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    return json_response(data)

  elif request.method == 'POST' and id_doc is None:
    # CREATE NEw doc
    ressource = '/entite/%s/document' % IDE
    params = request.get_json()
    PA_request = requests.post(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    print(data)
    return json_response({'pastel': data, 'link': '%s/Document/detail?id_d=%s&id_e=%s' % (root_url.split('/api/')[0], data['info']['id_d'],IDE )})

  elif request.method == 'POST' and id_doc and id_action:
    ressource = '/entite/%s/document/%s/action/%s' % (IDE, id_doc, id_action)
    PA_request = requests.post(root_url + ressource, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    return json_response({'action': data})

  elif request.method == 'PATCH':
    ressource = '/entite/%s/document/%s' % (IDE,id_doc)
    params = request.get_json()
    print (params)
    PA_request = requests.patch(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    print(PA_request.text)
    data = json.loads(PA_request.text)
    return json_response({'pastel': data})

@app.route("/document/<string:id_doc>/file/<string:element>/<string:numero>", methods=["POST"])
@login_required
def addFile(id_doc, element, numero='0'):
  if request.method == 'POST' and id_doc and element:
    # AJOUT Fichier
    ressource = '/entite/%s/document/%s/file/%s/%s' % (PASTELL_SESSIONS[g.uid]['details']['id_e'], id_doc, element, numero)
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
  ressource = '/entite/%s/document/%s/externalData/%s' % (PASTELL_SESSIONS[g.uid]['details']['id_e'], id_doc, field)
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

