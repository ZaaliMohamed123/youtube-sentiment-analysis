import requests
import time

API_URL = "http://localhost:8000"

def test_predict():
    print("=== Test endpoint /predict ===")
    comment = "This tutorial is really helpful and well explained!"
    
    response = requests.post(
        f"{API_URL}/predict",
        json={"text": comment}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Text: {result['text']}")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Probabilities: {result['probabilities']}")
    else:
        print(f"Erreur: {response.status_code} - {response.text}")


def test_batch():
    print("\n=== Test endpoint /predict/batch ===")
    comments = [
        "I love this video!",
        "This is boring",
        "Not bad, could be better",
        "Absolutely terrible waste of time",
        "Best tutorial ever!"
    ]
    
    response = requests.post(
        f"{API_URL}/predict/batch",
        json={"texts": comments}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Temps de traitement: {result['processing_time_ms']:.2f}ms")
        print("\nPrédictions:")
        for pred in result['predictions']:
            print(f"  Sentiment {pred['sentiment']}: {pred['text'][:50]}...")
    else:
        print(f"Erreur: {response.status_code} - {response.text}")


def test_health():
    print("\n=== Test health check ===")
    response = requests.get(f"{API_URL}/health")
    print(response.json())


if __name__ == "__main__":
    test_health()
    test_predict()
    test_batch()
