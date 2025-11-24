import os
import re
import pandas as pd
from sklearn.model_selection import train_test_split

RAW_PATH = os.path.join("data", "raw", "reddit.csv")
PROCESSED_DIR = os.path.join("data", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

def clean_text(text: str) -> str:
    text = str(text)
    # Supprimer URLs
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    # Supprimer mentions @user
    text = re.sub(r"@\w+", " ", text)
    # Garder lettres, chiffres et ponctuation simple
    text = re.sub(r"[^a-zA-Z0-9.,!?;:'\"()\s]", " ", text)
    # Mettre en minuscule
    text = text.lower()
    # Espaces multiples -> un seul
    text = re.sub(r"\s+", " ", text).strip()
    return text

def main():
    df = pd.read_csv(RAW_PATH)
    print("Colonnes originales :", df.columns)

    # Adapter ces lignes suivant les colonnes du dataset
    # Exemple 1 : si les colonnes s'appellent déjà 'text' et 'label'
    if "text" in df.columns and "label" in df.columns:
        text_col = "text"
        label_col = "label"
    # Exemple 2 : à adapter si nécessaire (remplace par les vrais noms)
    elif "clean_comment" in df.columns and "category" in df.columns:
        text_col = "clean_comment"
        label_col = "category"
    else:
        raise ValueError("Adapter les noms de colonnes text/label dans le script.")

    df = df[[text_col, label_col]].rename(columns={text_col: "text", label_col: "label"})

    # Nettoyage du texte
    df["text"] = df["text"].astype(str).apply(clean_text)

    # Suppression des lignes vides
    df = df[df["text"].str.len() > 0].dropna(subset=["text", "label"])

    # Après le chargement du CSV
    df = df.dropna(subset=["text", "label"])  # Supprime les lignes avec NaN
    df = df[df["text"].str.strip().astype(bool)]  # Supprime les textes vides

    # Si les labels sont textuels, on peut les mapper à -1/0/1 ici (adapter selon le cas)
    mapping = {
        "negative": -1,
        "neutral": 0,
        "positive": 1
    }
    if df["label"].dtype == object:
        df["label"] = df["label"].map(mapping)

    # Garde seulement -1,0,1
    df = df[df["label"].isin([-1, 0, 1])]

    print("\nAprès nettoyage :")
    print("Taille :", len(df))
    print("Distribution des labels :")
    print(df["label"].value_counts())

    # Sauvegarde temporaire des données nettoyées complètes
    cleaned_path = os.path.join(PROCESSED_DIR, "cleaned_full.csv")
    df.to_csv(cleaned_path, index=False)
    print(f"Données nettoyées sauvegardées dans {cleaned_path}")

    # Analyse exploratoire simple
    df["length"] = df["text"].str.len()
    print("\nStatistiques sur la longueur des commentaires :")
    print(df["length"].describe())

    # Vérification du minimum de 300 exemples par classe
    print("\nVérification du nombre d'exemples par classe :")
    print(df["label"].value_counts())

    # Split train/test reproductible (stratifié)
    train_df, test_df = train_test_split(
        df[["text", "label"]],
        test_size=0.2,
        random_state=42,
        stratify=df["label"]
    )

    print("\nTaille train :", len(train_df), " | Taille test :", len(test_df))

    train_path = os.path.join(PROCESSED_DIR, "train.csv")
    test_path = os.path.join(PROCESSED_DIR, "test.csv")

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"Train sauvegardé dans {train_path}")
    print(f"Test sauvegardé dans {test_path}")

if __name__ == "__main__":
    main()
