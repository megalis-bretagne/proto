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

@app.route("/version", methods=["GET"])
@login_required
def version():
  ressource = '/version'
  request = requests.get(root_url + ressource, auth=HTTPBasicAuth(u, p))
  data = json.loads(request.text)
  return json_response({'pastel': data['version_complete']})

@app.route("/user", methods=["GET"])
@login_required
def user():
  return json_response({'user': g.user})


@app.route("/document", methods=["POST"])
@app.route("/document/<string:id_doc>", methods=["POST","PATCH"])
@app.route("/document/<string:id_doc>/file/<string:element>", methods=["POST"])
@login_required
def document(id_doc=None, element=None):
  if request.method == 'POST' and id_doc is None:
    # CREATE NEw doc
    ressource = '/entite/1/document'
    params = request.get_json()
    PA_request = requests.post(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    data = json.loads(PA_request.text)
    return json_response({'pastel': data})
  elif request.method == 'POST' and id_doc and element:
    # AJOUT Fichier
    print ('fichier')
    test_file = open("/home/debian/test.pdf", "rb")
    ressource = '/entite/1/document/%s/file/%s' % (id_doc, element)
    if 'file_content' in request.files:
      fileStorage = request.files['file_content']
      filename = fileStorage.filename
      file=request.files['file_content'].read()

      PA_request = requests.post(root_url + ressource, files={'file_content': file}, data = { "file_name": filename}, auth=HTTPBasicAuth(u, p))
      data = json.loads(PA_request.text)
      print(data)
      return json_response({'pastel': data})



  if request.method == 'PATCH':
    ressource = '/entite/1/document/%s' % id_doc
    params = request.get_json()
    print (params)
    PA_request = requests.patch(root_url + ressource, data=params, auth=HTTPBasicAuth(u, p))
    print(PA_request.text)
    data = json.loads(PA_request.text)
    return json_response({'pastel': data})

def json_response(payload, status=200):
 return (json.dumps(payload), status, {'content-type': 'application/json'})