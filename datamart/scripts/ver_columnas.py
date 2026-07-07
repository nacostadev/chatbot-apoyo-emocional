import os
import json

ruta = os.path.join("datamart", "raw", "conversaciones_raw.json")
with open(ruta, "r", encoding="utf-8") as f:
    data = json.load(f)

print("🔍 Columnas encontradas en el primer registro:")
if data and len(data) > 0:
    print(data[0].keys())
    print("\n👀 Ejemplo del contenido del primer registro:")
    print(json.dumps(data[0], indent=2, ensure_ascii=False)[:500]) 
else:
    print("El archivo está vacío.")