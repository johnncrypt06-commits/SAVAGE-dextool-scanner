FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY *.py .
COPY alembic.ini .
COPY alembic/ alembic/
COPY backend/__init__.py backend/__init__.py
COPY backend/app/__init__.py backend/app/__init__.py
COPY backend/app/models.py backend/app/models.py
RUN mkdir -p data
EXPOSE 8080
CMD ["python", "bot.py"]
