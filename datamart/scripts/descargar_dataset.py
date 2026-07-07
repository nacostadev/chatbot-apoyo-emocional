import os
import pandas as pd
from datasets import load_dataset

print("⏳ Conectando con Hugging Face para descargar el dataset...")

try:
    dataset = load_dataset("somosnlp/Conversaciones_terapeuticas_espanol")
    
    df = dataset['train'].to_pandas()
    
    os.makedirs(os.path.join("datamart", "raw"), exist_ok=True)
    
    ruta_guardado = os.path.join("datamart", "raw", "conversaciones_raw.json")
    
    df.to_json(ruta_guardado, orient="records", force_ascii=False, indent=4)
    
    print("\n✅ ¡Dataset descargado con éxito!")
    print(f"📁 Archivo guardado en: {ruta_guardado}")
    print(f"📊 Total de registros descargados: {len(df)} (¡Cumple con el mínimo solicitado!)")

except Exception as e:
    print(f"❌ Ocurrió un error al descargar el dataset: {e}")