FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ ./backend/
COPY alembic/ ./alembic/
COPY alembic.ini .
COPY trader.py config.py crypto_utils.py db.py ./
COPY requirements.txt ./requirements-bot.txt
RUN pip install --no-cache-dir -r requirements-bot.txt
EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
