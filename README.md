---
title: YouTube Sentiment Analyzer
emoji: 😊
colorFrom: blue
colorTo: green
sdk: docker
sdk_version: "3.10"
app_file: app.py
pinned: false
---

# YouTube Sentiment Analysis API

API de détection de sentiment pour commentaires YouTube, déployée sur Hugging Face Spaces.

## Endpoints

- **GET /** : Page d'accueil
- **GET /health** : Vérification santé
- **POST /predict** : Analyser un commentaire
- **POST /predict/batch** : Analyser plusieurs commentaires
- **GET /docs** : Documentation Swagger UI

## Modèle

Modèle TF-IDF + Régression Logistique entraîné sur dataset Reddit avec :
- Accuracy : 82.6%
- F1-score : > 0.75 par classe

## Utilisation

curl -X POST "https://SyntaxError-123-sentiment-analysis.hf.space/predict"
-H "Content-Type: application/json"
-d '{"text": "Great video!"}'


## Extension Chrome

Cette API alimente l'extension Chrome pour analyser les commentaires YouTube en temps réel.
