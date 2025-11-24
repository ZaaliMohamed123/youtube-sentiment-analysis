# Utiliser une image Python légère
FROM python:3.10-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier les fichiers nécessaires
COPY src/api/app_api.py ./app.py
COPY models/sentiment_pipeline.joblib ./models/sentiment_pipeline.joblib
COPY README.md ./README.md

# Créer le répertoire models
RUN mkdir -p /app/models

# Exposer le port 7860 (standard Hugging Face)
EXPOSE 7860

# Commande de démarrage
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--timeout-keep-alive", "60"]
