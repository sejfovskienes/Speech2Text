#--- frontend
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

COPY frontend/ ./

RUN npm start

#--- backend

FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /backend/app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/pyproject.toml ./

RUN pip install --upgrade pip
RUN poetry install

COPY backend/ ./

COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 8000

CMD ["cd", "backend"]
CMD [".venv","\Scripts", "\Activate"]
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]