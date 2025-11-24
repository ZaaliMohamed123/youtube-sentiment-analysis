from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any
import joblib
import os
import time
import numpy as np

app = FastAPI(
    title="YouTube Sentiment Analysis API",
    description="API pour analyser le sentiment des commentaires YouTube",
    version="1.0.0"
)

# Chargement du modèle au démarrage
MODELS_DIR = "models"
pipeline_path = os.path.join(MODELS_DIR, "sentiment_pipeline.joblib")

if not os.path.exists(pipeline_path):
    raise FileNotFoundError(f"Modèle non trouvé : {pipeline_path}")

model = joblib.load(pipeline_path)


class CommentInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Texte du commentaire")


class BatchInput(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100, description="Liste de commentaires")


class PredictionOutput(BaseModel):
    sentiment: int
    probabilities: Dict[str, float]
    confidence: float
    text: str


class BatchOutput(BaseModel):
    predictions: List[PredictionOutput]
    processing_time_ms: float


def predict_single(text: str) -> tuple:
    """Prédit le sentiment d'un seul commentaire"""
    start = time.time()
    
    # Nettoyage basique
    text = str(text).strip()
    if not text:
        raise ValueError("Texte vide")
    
    # Prédiction
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    
    # Formatage des probabilités
    prob_dict = {
        "-1": float(probabilities[0]),
        "0": float(probabilities[1]),
        "1": float(probabilities[2])
    }
    
    confidence = float(max(probabilities))
    processing_time = (time.time() - start) * 1000  # en ms
    
    return prediction, prob_dict, confidence, processing_time


@app.get("/")
async def root():
    return {"message": "YouTube Sentiment Analysis API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionOutput)
async def predict_sentiment(input_data: CommentInput):
    try:
        sentiment, probabilities, confidence, _ = predict_single(input_data.text)
        
        return PredictionOutput(
            sentiment=sentiment,
            probabilities=probabilities,
            confidence=confidence,
            text=input_data.text[:200]  # Limite l'affichage
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction : {str(e)}")


@app.post("/predict/batch", response_model=BatchOutput)
async def predict_batch(input_data: BatchInput):
    try:
        start_time = time.time()
        predictions = []
        
        for text in input_data.texts:
            sentiment, probabilities, confidence, _ = predict_single(text)
            
            predictions.append(
                PredictionOutput(
                    sentiment=sentiment,
                    probabilities=probabilities,
                    confidence=confidence,
                    text=text[:200]
                )
            )
        
        total_time = (time.time() - start_time) * 1000
        
        return BatchOutput(
            predictions=predictions,
            processing_time_ms=total_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction batch : {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
