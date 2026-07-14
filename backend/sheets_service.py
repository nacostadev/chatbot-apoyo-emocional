import requests

URL_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbxqebTjsWoi_PbF9Z8ugEVJKJMv5-_dqy6-LeexNnGROiObj-OI5YZHB5oLw6AzmvNu/exec"


def enviar_a_sheets(datos: dict) -> dict:
    """
    Envía datos al Apps Script (doPost) para que los guarde en el Google Sheet.
    Se ejecuta desde el servidor, así que no hay problema de CORS.
    """
    try:
        respuesta = requests.post(URL_GOOGLE_SHEETS, json=datos, timeout=15)
        respuesta.raise_for_status()
        return respuesta.json()
    except Exception as e:
        print(f"[sheets_service] Error enviando a Google Sheets: {e}")
        return {"status": "error", "message": str(e)}


def obtener_metricas_sheets() -> dict:
    """
    Lee los datos guardados en el Google Sheet (doGet) para el dashboard.
    """
    try:
        respuesta = requests.get(URL_GOOGLE_SHEETS, timeout=15)
        respuesta.raise_for_status()
        return respuesta.json()
    except Exception as e:
        print(f"[sheets_service] Error obteniendo métricas: {e}")
        return {"diagnosticos": [], "satisfacciones": [], "error": str(e)}