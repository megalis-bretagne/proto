FROM python:3.12.0-alpine

EXPOSE 80

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY api/ ./api/

CMD ["waitress-serve","--port=80","--call", "api:create_app"]