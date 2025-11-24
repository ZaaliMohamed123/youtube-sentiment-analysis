# YouTube Sentiment Analysis - MLOps Pipeline

![Python](https://img.shields.io/badge/Python-3.10-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Docker](https://img.shields.io/badge/Docker-✓-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange)

Pipeline MLOps complet pour analyser automatiquement le sentiment des commentaires YouTube en temps réel.

## 🎯 Objectifs

- Détection de sentiment (Positif/Neutre/Négatif) avec > 80% d'accuracy
- API REST déployée sur le cloud (Hugging Face Spaces)
- Extension Chrome pour analyse en temps réel sur YouTube
- Architecture MLOps robuste et scalable

## 📁 Structure du projet



```

youtube-sentiment-analysis/
│
├── 📂 data/                          \# Données
│   ├── 📂 raw/                       \# Données brutes (non versionnées)
│   │   ├── reddit.csv                \# Dataset Reddit téléchargé
│   │   └── .gitkeep
│   └── 📂 processed/                 \# Données nettoyées et split
│       ├── train.csv                 \# Données d'entraînement
│       ├── test.csv                  \# Données de test
│       └── cleaned_full.csv          \# Dataset complet nettoyé
│
├── 📂 models/                        \# Modèles ML (Git LFS)
│   ├── sentiment_pipeline.joblib     \# Pipeline complet TF-IDF + LogReg
│   ├── tfidf_vectorizer.joblib       \# Vectoriseur séparé
│   ├── logreg_model.joblib           \# Classifieur séparé
│   └── .gitkeep
│
├── 📂 src/                           \# Code source
│   ├── 📂 data/                      \# Scripts de traitement des données
│   │   ├── download_dataset.py       \# Téléchargement automatique Reddit
│   │   └── preprocess_data.py        \# Nettoyage, EDA, split train/test
│   │
│   ├── 📂 models/                    \# Scripts d'entraînement
│   │   └── train_model.py            \# Entraînement + GridSearchCV
│   │
│   └── 📂 api/                       \# Application FastAPI
│       ├── app.py                    \# API locale (dev)
│       └── app_api.py                \# API cloud optimisée (prod)
│
├── 📂 chrome-extension/              \# Extension Chrome
│   ├── manifest.json                 \# Configuration de l'extension
│   ├── popup.html                    \# Interface utilisateur
│   ├── popup.js                      \# Logique métier
│   ├── styles.css                    \# Styles modernes
│   ├── content.js                    \# Extraction des commentaires
│   └── 📂 icons/                     \# Icônes de l'extension
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── 📂 tests/                         \# Tests de validation
│   └── test_model.py                 \# Tests unitaires du modèle
│
├── 📂 logs/                          \# Fichiers de log (non versionnés)
│   └── .gitkeep
│
├── 📄 requirements.txt               \# Dépendances Python
├── 📄 Dockerfile                     \# Configuration Docker
├── 📄 README.md                      \# Documentation du projet
├── 📄 .gitignore                     \# Fichiers à ignorer par Git
└── 📄 .gitattributes                 \# Configuration Git LFS

```



## 🚀 Installation et utilisation

### 1. Configuration environnement



# Cloner le repository

git clone https://github.com/TonUsername/youtube-sentiment-analysis.git
cd youtube-sentiment-analysis

# Créer environnement virtuel

python3 -m venv venv
source venv/bin/activate

# Installer dépendances

pip install -r requirements.txt



### 2. Pipeline de données




# Télécharger dataset

python src/data/download_dataset.py

# Prétraiter et créer train/test

python src/data/preprocess_data.py

### 3. Entraînement du modèle


python src/models/train_model.py



**Performances obtenues** :
- Accuracy (test) : 82.6%
- F1-score par classe : > 0.75
- Temps d'inférence : < 100ms/commentaire

### 4. Lancer l'API localement



python -m uvicorn src.api.app:app --reload --port 8000



Accéder à :
- API : http://localhost:8000
- Docs Swagger : http://localhost:8000/docs

### 5. Extension Chrome

1. Ouvrir `chrome://extensions/`
2. Activer **Mode développeur**
3. Charger l'extension depuis `chrome-extension/`
4. Ouvrir une vidéo YouTube et cliquer sur l'icône

### 6. Déploiement cloud




# Construire image Docker

docker build -t sentiment-api .

# Pousser vers Hugging Face Spaces

# (voir documentation HF Spaces)


URL de production : `https://syntaxerror-123-youtube-sentiment-analysis.hf.space`

## 🧪 Tests


Tests effectués :
- ✅ Modèle : accuracy > 80%, F1 > 0.75
- ✅ API : endpoints fonctionnels, temps de réponse < 100ms
- ✅ Extension : extraction, filtres, export CSV
- ✅ Déploiement : cloud stable et accessible


## 🔧 Technologies utilisées

- **ML** : Scikit-learn (TF-IDF + Logistic Regression)
- **API** : FastAPI, Uvicorn
- **Cloud** : Docker, Hugging Face Spaces
- **Frontend** : Extension Chrome (HTML/CSS/JS)
- **Outils** : Git, GitHub, Git LFS

## 📚 Ressources

- Dataset : Reddit Sentiment Analysis Dataset
- Documentation : [Swagger UI](https://syntaxerror-123-youtube-sentiment-analysis.hf.space/docs)
- Extension Chrome : disponible dans `chrome-extension/`

## 👨‍💻 Auteur

SyntaxError - Projet MLOps - Virtualisation & Cloud Computing

## 📝 Licence

MIT License