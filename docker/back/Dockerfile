FROM python:3.12.0-alpine

EXPOSE 80

WORKDIR /appli

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/
COPY config/ ./config/

RUN rm /appli/config/config_template.yml


CMD ["waitress-serve","--port=80","--call", "app:app_base"]