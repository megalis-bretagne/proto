from flask import Flask, json, g, request
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
import logging

from back.api import login_required

logging.basicConfig(
        format="%(asctime)s.%(msecs)03d : %(levelname)s : %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
logger = logging.getLogger()
logger.setLevel(logging.INFO)



app = Flask(__name__, instance_relative_config=True)
CORS(app, resources={r"*": {"origins": "*"}})

app.config.from_object('back.config.config')
u = app.config['PASTELL_USER']
p = app.config['PASTELL_PASSWORD']
restricted_roles =  app.config['RESTRITED_ROLES']
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
  status = PArequest.status_code
  if status == 200:
    return json_response({'pastel': data['version_complete']}, status)
  else:
    return json_response({'status': 'error'}, status)


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
    siren = '253514491'
    # if 'siren' in params.keys():
    #   siren = params['siren']
    # else:
    #   return json_response({"erreur": "Le SIREN est inconnu"})
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
    status = PArequest.status_code
    if status == 200:
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
          current_user['siren'] = siren
          ressource3 = '/utilisateur/%s/role' % id_u
          request3 = requests.get(root_url + ressource3, auth=HTTPBasicAuth(u, p))
          current_user['roles'] = json.loads(request3.text)
          infos = current_user
          #STORE TEMPORALY LOGIN INFOS iN SESSION
          PASTELL_SESSIONS[g.uid] = {'user': g.user, 'details': infos}
          break
    else:
      return json_response({'status': 'error'}, status)

  response = { "erreur" : "utilisateur %s non trouvé dans Pastell " % g.username}


  if g.uid in PASTELL_SESSIONS.keys():
    checkedAuth = checkAuth()
    allowed_role = checkedAuth['allowed_role']
    id_e = checkedAuth['id_e']
    logger.info('%s - %s - entité : %s - %s' % (g.user, allowed_role, id_e, "Connecté" ))
    response = PASTELL_SESSIONS[g.uid]
    status = 200
  return json_response(response, status)




@app.route("/document", methods=["POST", "GET"])
@app.route("/document/<string:id_doc>", methods=["POST","PATCH","DELETE"])
@app.route("/document/<string:id_doc>/action/<string:id_action>", methods=["POST"])
@login_required
def document(id_doc=None, element=None, field=None, id_action=None):
  checkedAuth = checkAuth()
  allowed_role = checkedAuth['allowed_role']
  USER = checkedAuth['user']
  IDE = checkedAuth['id_e']
  if  allowed_role == False:
    logger.warning('%s - %s - %s' % (USER,  IDE, "Role non autorisé" ))
    return json_response([], 403)

  if request.method == 'GET':
    ressource = '/entite/%s/document' % IDE
    PA_request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
    status = PA_request.status_code
    data = json.loads(PA_request.text)
    return json_response(data, status)

  elif request.method == 'POST' and id_doc is None:
    # CREATE NEw doc
    ressource = '/entite/%s/document' % IDE
    params = request.get_json()
    PA_request = requests.post(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    status = PA_request.status_code
    if status == 201:
      data = json.loads(PA_request.text)
      logger.info('%s - %s - %s' % (USER, "Document créé" , data['id_d']))
      return json_response({'pastel': data, 'link': '%s/Document/detail?id_d=%s&id_e=%s' % (root_url.split('/back/')[0], data['id_d'],IDE )}, status)
    else:
      return json_response({'status': 'error'}, status)

  elif request.method == 'POST' and id_doc and id_action:
    ressource = '/entite/%s/document/%s/action/%s' % (IDE, id_doc, id_action)
    PA_request = requests.post(root_url + ressource, auth=HTTPBasicAuth(u, p))
    status = PA_request.status_code
    if status == 201:
      data = json.loads(PA_request.text)
      logger.info('%s - %s - %s' % (USER, "Document publié" , id_doc))
      return json_response({'action': data}, status)
    else:
      return json_response({'status': 'error'}, status)

  elif request.method == 'PATCH':
    ressource = '/entite/%s/document/%s' % (IDE,id_doc)
    params = request.get_json()
    PA_request = requests.patch(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    status = PA_request.status_code
    if status == 200:
      data = json.loads(PA_request.text)
      logger.info('%s - %s - %s - %s' % (USER, "Document modifié" , id_doc, params))
      return json_response({'pastel': data}, status)
    else:
      return json_response({'status': 'error'}, status)

  elif request.method == 'DELETE' and id_doc:
    ressource = '/entite/%s/document/%s/action/supression' % (IDE, id_doc)
    PA_request = requests.post(root_url + ressource, auth=HTTPBasicAuth(u, p))
    status = PA_request.status_code
    print(status)
    if status == 201:
      data = json.loads(PA_request.text)
      logger.info('%s - %s - %s' % (USER, "Document supprimé" , id_doc))
      return json_response({'pastel': data}, 200)
    else:
      return json_response({'status': 'error'}, status)

@app.route("/document/<string:id_doc>/file/<string:element>/<string:numero>", methods=["POST", "DELETE"])
@login_required
def addFile(id_doc, element, numero='0'):
  checkedAuth = checkAuth()
  allowed_role = checkedAuth['allowed_role']
  USER = checkedAuth['user']
  IDE = checkedAuth['id_e']
  if  allowed_role == False:
    logger.warning('%s - %s - %s' % (USER,  IDE, "Role non autorisé" ))
    return json_response([], 403)


  ressource = '/entite/%s/document/%s/file/%s/%s' % (PASTELL_SESSIONS[g.uid]['details']['id_e'], id_doc, element, numero)
  if request.method == 'POST' and id_doc and element:
    # AJOUT Fichier
    if 'file_content' in request.files:
      fileStorage = request.files['file_content']
      filename = fileStorage.filename
      file=request.files['file_content'].read()
      PA_request = requests.post(root_url + ressource, files={'file_content': file}, data = { "file_name": filename}, auth=HTTPBasicAuth(u, p))
      status = PA_request.status_code
      if status == 201:
        data = json.loads(PA_request.text)
        logger.info('%s - %s - %s - %s' % (USER, id_doc, element, "Fichier publié" ))
        return json_response({'pastel': data}, status)
      else:
        return json_response({'status': 'error'}, status)

  elif request.method == 'DELETE'and id_doc and element:
    PA_request2 = requests.delete(root_url + ressource, auth=HTTPBasicAuth(u, p))
    status = PA_request2.status_code
    if status == 200:
      data2 = json.loads(PA_request2.text)
      logger.info('%s - %s - %s - %s' % (USER, id_doc, element, "Fichier supprimé" ))
      return json_response({'pastel': data2}, status)
    else:
      return json_response({'status': 'error'}, status)



@app.route("/document/<string:id_doc>/externalData/<string:field>", methods=["GET"])
@login_required
def externalData(id_doc, field):
  #ExternaData
  ressource = '/entite/%s/document/%s/externalData/%s' % (PASTELL_SESSIONS[g.uid]['details']['id_e'], id_doc, field)
  request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
  status = request.status_code
  data = json.loads(request.text)
  return json_response({'externalData': { field: data}}, status)



def json_response(payload, status=200):
 return (json.dumps(payload), status, {'content-type': 'application/json'})

def checkAuth():
  global PASTELL_SESSIONS
  global restricted_roles
  allowed_role = (len(restricted_roles) == 0)
  if g.uid in PASTELL_SESSIONS.keys():
    user = PASTELL_SESSIONS[g.uid]['user']
    ide = PASTELL_SESSIONS[g.uid]['details']['id_e']
    #check for allowed roles
    roles = PASTELL_SESSIONS[g.uid]['details']['roles']
    if not allowed_role:
      for role in roles:
        if role['role'] in restricted_roles:
          allowed_role = role['role']
          break
        else:
          allowed_role = False
    else:
      allowed_role = 'no filtered role'
    return {'user': user, 'id_e': ide, 'allowed_role': allowed_role}


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

