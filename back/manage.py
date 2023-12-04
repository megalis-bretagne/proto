import waitress

from api.endpoints import app as application


if __name__ == "__main__":
    application.run()
