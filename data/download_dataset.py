import os
import pandas as pd

URL = "https://raw.githubusercontent.com/Himanshu-1703/reddit-sentiment-analysis/refs/heads/main/data/reddit.csv"
RAW_DIR = os.path.join("data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

def main():
    print(f"Téléchargement du dataset depuis {URL} ...")
    df = pd.read_csv(URL)

    print("\nAperçu des colonnes disponibles :")
    print(df.columns)

    print("\nPremières lignes :")
    print(df.head())

    print("\nTaille du dataset :", len(df))
    if "label" in df.columns:
        print("\nDistribution des labels :")
        print(df["label"].value_counts())

    output_path = os.path.join(RAW_DIR, "reddit.csv")
    df.to_csv(output_path, index=False)
    print(f"\nDataset sauvegardé dans {output_path}")

if __name__ == "__main__":
    main()
