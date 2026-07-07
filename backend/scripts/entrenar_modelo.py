import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

print(" Iniciando el entrenamiento del modelo del Sistema Inteligente...")

ruta_datamart = os.path.join("datamart", "processed", "datamart_emocional.csv")
ruta_modelo_dir = os.path.join("backend", "model")  

os.makedirs(ruta_modelo_dir, exist_ok=True)

if not os.path.exists(ruta_datamart):
    print(f"❌ Error: No se encontró el Data Mart en {ruta_datamart}. Corre el script ETL primero.")
    exit()

df = pd.read_csv(ruta_datamart)

X = df["texto_original"]
y = df["dimension_psicologica"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"📊 Datos de entrenamiento: {len(X_train)} ejemplos | Datos de validación: {len(X_test)} ejemplos")

print("Transformando texto a variables numéricas (TF-IDF)...")
vectorizador = TfidfVectorizer(max_features=2500, stop_words=None) # Mantiene contexto en español
X_train_tfidf = vectorizador.fit_transform(X_train)
X_test_tfidf = vectorizador.transform(X_test)

print(" Calibrando el algoritmo clasificador de patrones emocionales...")
modelo_ia = LogisticRegression(max_iter=500, class_weight='balanced')
modelo_ia.fit(X_train_tfidf, y_train)

y_pred = modelo_ia.predict(X_test_tfidf)
precision = accuracy_score(y_test, y_pred)
print(f"\n🎯 ¡Entrenamiento completado! Precisión del Modelo (Accuracy): {precision * 100:.2f}%")

print("\n📊 Reporte Técnico de Clasificación (Variables de Tesis):")
print(classification_report(y_test, y_pred))

ruta_archivo_modelo = os.path.join(ruta_modelo_dir, "modelo_emocional.pkl")
ruta_archivo_vectorizador = os.path.join(ruta_modelo_dir, "vectorizador_texto.pkl")

joblib.dump(modelo_ia, ruta_archivo_modelo)
joblib.dump(vectorizador, ruta_archivo_vectorizador)

print(f"✅ Archivos de inteligencia guardados con éxito en la ruta: '{ruta_modelo_dir}'")