import waitress

from api.endpoints import app as application


waitress.serve(app, port=8041, url_scheme='https')


if __name__ == "__main__":
    application.run()
