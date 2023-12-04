FROM python:3.12.0-alpine

EXPOSE 80

WORKDIR /app

COPY back/equirements.txt .
RUN pip install -r requirements.txt

COPY back/api/ ./app/
COPY back/config/ ./config/
RUN rm /app/config/config.py_template

CMD ["waitress-serve","--port=80","--call", "api.endpoints:app.run"]