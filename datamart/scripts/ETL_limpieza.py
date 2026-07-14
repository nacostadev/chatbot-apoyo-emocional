import os
import json
import pandas as pd

print("⏳ Iniciando proceso ETL para la construcción del Data Mart...")

ruta_input = os.path.join("datamart", "raw", "conversaciones_raw.json")
ruta_output_dir = os.path.join("datamart", "processed")
ruta_output_file = os.path.join(ruta_output_dir, "datamart_emocional.csv")

os.makedirs(ruta_output_dir, exist_ok=True)

if not os.path.exists(ruta_input):
    print(f"❌ Error: No se encontró el archivo de origen en {ruta_input}.")
    exit()

# 1. LEER LA DATA (E)
with open(ruta_input, "r", encoding="utf-8") as f:
    data = json.load(f)

df_raw = pd.DataFrame(data)

# 2. TRANSFORMACIÓN Y LIMPIEZA (T)
registros_procesados = []

keywords_estres = ["estrés", "estres", "presión", "presion", "abrumado", "carga", "exámenes", "universidad", "estudios"]
keywords_ansiedad = ["ansiedad", "miedo", "asustado", "nervioso", "pánico", "panico", "preocupado", "asfixia", "temblor"]
keywords_agotamiento = ["agotado", "cansado", "exhausto", "sin fuerzas", "fatiga", "vacío", "dormir", "desvelo", "insomnio"]
keywords_cinismo = ["cinismo", "indiferente", "desmotivado", "distante", "utilidad", "sin sentido", "desinterés", "apatía", "apático", "cuestiono"]
keywords_eficacia = ["eficaz", "estimulado", "logro", "meta", "capaz", "éxito", "orgulloso", "rendir", "confianza", "seguro"]

print("🧹 Procesando el árbol de diálogos y aplicando reglas psicológicas...")

for index, row in df_raw.iterrows():
    texto = ""
    
    if "chat" in row and isinstance(row["chat"], list):
        for msg in row["chat"]:
            if isinstance(msg, dict) and "content" in msg:
                contenido = str(msg["content"])
                if "Actúa como un psicólogo" not in contenido and len(contenido) > 10:
                    texto = contenido
                    break
                    
    if not texto and "chat" in row and isinstance(row["chat"], list) and len(row["chat"]) > 0:
        texto = str(row["chat"][-1].get("content", ""))

    texto_limpio = texto.strip().replace("\n", " ").replace("\r", "")
    texto_minuscula = texto_limpio.lower()
    
    if not texto_limpio or len(texto_limpio) < 5:
        continue
        
    categoria = "General / Apoyo Emocional"
    nivel_riesgo = "Bajo"
    
    cont_estres = sum(1 for kw in keywords_estres if kw in texto_minuscula)
    cont_ansiedad = sum(1 for kw in keywords_ansiedad if kw in texto_minuscula)
    cont_agotamiento = sum(1 for kw in keywords_agotamiento if kw in texto_minuscula)
    cont_cinismo = sum(1 for kw in keywords_cinismo if kw in texto_minuscula)
    cont_eficacia = sum(1 for kw in keywords_eficacia if kw in texto_minuscula)
    
    max_cont = max(cont_estres, cont_ansiedad, cont_agotamiento, cont_cinismo, cont_eficacia)
    
    if max_cont > 0:
        if max_cont == cont_estres:
            categoria = "Estrés (DASS-21)"
            nivel_riesgo = "Moderado" if cont_estres == 1 else "Crítico"
        elif max_cont == cont_ansiedad:
            categoria = "Ansiedad (DASS-21)"
            nivel_riesgo = "Moderado" if cont_ansiedad == 1 else "Crítico"
        elif max_cont == cont_agotamiento:
            categoria = "Agotamiento Emocional (MBI-SS)"
            nivel_riesgo = "Moderado" if cont_agotamiento == 1 else "Crítico"
        elif max_cont == cont_cinismo:
            categoria = "Cinismo (MBI-SS)"
            nivel_riesgo = "Moderado" if cont_cinismo == 1 else "Crítico"
        else:
            categoria = "Eficacia Académica (MBI-SS)"
            nivel_riesgo = "Moderado" if cont_eficacia == 1 else "Crítico"

    registros_procesados.append({
        "id_registro": len(registros_procesados) + 1,
        "texto_original": texto_limpio,
        "dimension_psicologica": categoria,
        "nivel_riesgo_estimado": nivel_riesgo
    })

# 3. CARGA (L)
if registros_procesados:
    df_datamart = pd.DataFrame(registros_procesados)
    df_datamart.to_csv(ruta_output_file, index=False, encoding="utf-8")
    print("\n✅ ¡Fase ETL Completada con éxito!")
    print(f"📁 Data Mart creado en: {ruta_output_file}")
    print(f"📊 Total de registros útiles estructurados: {len(df_datamart)}")
    print("\n👀 Vista previa del Data Mart:")
    print(df_datamart[["id_registro", "dimension_psicologica", "nivel_riesgo_estimado"]].head(5))
else:
    print("\n❌ Error Crítico: No se pudo extraer texto. Verifica la estructura.")