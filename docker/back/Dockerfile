FROM python:3.12.0-alpine

EXPOSE 80

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY api/ ./api/
COPY config/ ./config/

RUN rm /app/config/config.py_template

CMD ["waitress-serve","--port=80","--call", "api:create_app"]