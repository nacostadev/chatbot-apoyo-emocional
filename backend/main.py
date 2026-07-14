import os
import joblib
import random
import sys
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Configuración segura de rutas para importación de submódulos locales
ruta_raiz = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ruta_raiz not in sys.path:
    sys.path.insert(0, ruta_raiz)

# Importaciones de tu banco de preguntas y servicio de Google Sheets
try:
    from backend.preguntas_banco import obtener_pregunta_aleatoria
    from backend.sheets_service import enviar_a_sheets, obtener_metricas_sheets
except ModuleNotFoundError:
    # Fallback si ejecutas el comando directamente dentro de la carpeta 'backend'
    from preguntas_banco import obtener_pregunta_aleatoria
    from sheets_service import enviar_a_sheets, obtener_metricas_sheets

app = FastAPI(title="API UCV - Sistema Inteligente de Evaluación Psicoemocional")

# Configuración de CORS con soporte explícito para localhost y pruebas locales
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5500",  # Común si usas Live Server de VS Code
        "http://127.0.0.1:5500",
        "*"                       # Permite accesos temporales libres en pruebas
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carga predictiva del modelo de Machine Learning (NLP)
ruta_modelo = os.path.join("backend", "model", "modelo_emocional.pkl")
ruta_vectorizador = os.path.join("backend", "model", "vectorizador_texto.pkl")

if not os.path.exists(ruta_modelo):
    # Si se ejecuta desde dentro de la subcarpeta 'backend'
    ruta_modelo = os.path.join("model", "modelo_emocional.pkl")
    ruta_vectorizador = os.path.join("model", "vectorizador_texto.pkl")

modelo_ia = joblib.load(ruta_modelo) if os.path.exists(ruta_modelo) else None
vectorizador = joblib.load(ruta_vectorizador) if os.path.exists(ruta_vectorizador) else None

MAPEO_OPCIONES_TEXTO = {
    0: "nunca siento este malestar todo en orden",
    1: "varios días con ligera incomodidad o cansancio",
    2: "más de la mitad de los días con desgaste evidente",
    3: "casi todos los días con extrema tensión y afectación"
}

# ==========================================
# ESTRUCTURAS DE DATOS DE ENTRADA (Pydantic v2 compatible)
# ==========================================
class TurnoInput(BaseModel):
    indice_pregunta: int
    valor_respuesta: str
    historial_categorias: List[str]
    historial_preguntas_text: List[str]

class DiagnosticoGuardar(BaseModel):
    action: str
    Fecha: str
    Estudiante: str
    Edad: int
    Sexo: str
    Facultad: str
    Score_Estres: float      
    Score_Ansiedad: float   
    Score_Agotamiento: float 
    Score_Cinismo: float     
    Score_Eficacia: float
    Alerta: str
    Diagnostico: str
    Rpta_Estres: Optional[str] = ""
    Rpta_Ansiedad: Optional[str] = ""
    Rpta_Agotamiento: Optional[str] = ""
    Rpta_Cinismo: Optional[str] = ""
    Rpta_Eficacia: Optional[str] = ""

class SatisfaccionGuardar(BaseModel):
    Fecha: str
    Estudiante: str
    Facultad: str
    ClaridadPreguntas: int
    CoherenciaBot: int
    SugerenciaComentario: str

class DiagnosticoProcesarInput(BaseModel):
    respuestas_valores: List[str]
    tipos_preguntas: List[str]
    categorias_respondidas: List[str]

# ==========================================
# ENDPOINTS DE CONTROL Y RUTA LOGÍSTICA
# ==========================================

@app.get("/api/status")
def home():
    return {"status": "online", "entorno": "localhost", "mensaje": "Servidor UCV activo localmente"}

@app.get("/primera-pregunta")
def primera_pregunta():
    """Entrega la pregunta inicial del banco de forma controlada."""
    pregunta_inicial = obtener_pregunta_aleatoria("inicio", [])
    return {
        "pregunta": pregunta_inicial,
        "categoria": "inicio",
        "tipo": "texto_libre",
        "indice_siguiente": 1
    }

@app.post("/procesar-turno")
def procesar_turno(entrada: TurnoInput):
    """Evalúa la respuesta actual, predice con NLP heurístico y entrega la siguiente pregunta."""
    idx = entrada.indice_pregunta

    # Flujo formal de 10 turnos (1 inicio + 9 preguntas de dimensiones)
    # 2 de Estrés, 2 de Ansiedad, 2 de Agotamiento, 2 de Cinismo, 1 de Eficacia
    mapeo_flujo = {
        1: ("estres_frecuencia", "opciones"),
        2: ("estres_profunda", "texto_libre"),
        3: ("ansiedad_frecuencia", "opciones"),
        4: ("ansiedad_profunda", "texto_libre"),
        5: ("agotamiento_frecuencia", "opciones"),
        6: ("agotamiento_profunda", "texto_libre"),
        7: ("cinismo_frecuencia", "opciones"),
        8: ("cinismo_profunda", "texto_libre"),
        9: ("eficacia_frecuencia", "opciones")
    }

    if idx > 9:
        return {"finalizado": True}

    cat_clave, tipo_rpta = mapeo_flujo[idx]
    pregunta_siguiente = obtener_pregunta_aleatoria(cat_clave, entrada.historial_preguntas_text)

    # Generación de feedback empático predictivo adaptado al input del alumno
    feedback = "Comprendo lo que mencionas. Sigamos analizando tu entorno académico..."
    val_limpio = entrada.valor_respuesta.lower().strip()

    if tipo_rpta == "opciones":
        if "3" in val_limpio:
            feedback = "Lamento que experimentes esta carga casi a diario. Sigamos para evaluar con precisión..."
        elif "0" in val_limpio:
            feedback = "Me alegra que esta situación no te afecte. Continuemos con la siguiente pregunta..."
    else:
        if len(val_limpio) > 25:
            feedback = "Agradezco mucho que compartas esto con tanto detalle, es de gran valor para tu análisis. Sigamos..."

    return {
        "finalizado": False,
        "pregunta_siguiente": pregunta_siguiente,
        "categoria_siguiente": cat_clave.split("_")[0],
        "tipo_siguiente": tipo_rpta,
        "indice_siguiente": idx + 1,
        "feedback": feedback
    }

@app.post("/diagnostico-final")
def diagnostico_final(entrada: DiagnosticoProcesarInput):
    """
    Computa de manera aislada los porcentajes (0-100%) para las 5 dimensiones clínicas
    y genera el cierre predictivo del diagnóstico.
    """
    dimensiones = ["estres", "ansiedad", "agotamiento", "cinismo", "eficacia"]
    puntos = {d: 0.0 for d in dimensiones}
    maximos = {d: 0.0 for d in dimensiones}
    textos_libres = {d: [] for d in dimensiones}

    for i in range(len(entrada.respuestas_valores)):
        val = entrada.respuestas_valores[i]
        cat_sucia = entrada.categorias_respondidas[i].lower()
        tipo = entrada.tipos_preguntas[i]

        # CORRECCIÓN DE LIMPIEZA: Asegura emparejar "agotamiento_frecuencia" -> "agotamiento"
        cat = None
        for d in dimensiones:
            if d in cat_sucia:
                cat = d
                break

        if not cat:
            continue

        if tipo == "opciones":
            try:
                score = float(val)
                puntos[cat] += score
                maximos[cat] += 3.0  # El valor de frecuencia máximo es 3
            except ValueError:
                pass
        else:
            textos_libres[cat].append(val)

    # Procesamiento del vectorizador y modelo IA si están cargados para reajustar pesos clínicos
    texto_total = " ".join([t for sublist in textos_libres.values() for t in sublist if t])
    peso_ia_burnout = 0.0

    if modelo_ia and vectorizador and texto_total.strip():
        try:
            vectorizado = vectorizador.transform([texto_total])
            prediccion = modelo_ia.predict(vectorizado)
            if prediccion[0] == 1:
                peso_ia_burnout = 15.0
        except Exception as e:
            print(f"Error en inferencia IA: {e}")

    # Normalización matemática y cálculo de porcentajes clínicos reales
    score_estres = (puntos["estres"] / maximos["estres"] * 100) if maximos["estres"] > 0 else 0.0
    score_ansiedad = (puntos["ansiedad"] / maximos["ansiedad"] * 100) if maximos["ansiedad"] > 0 else 0.0
    score_agotamiento = (puntos["agotamiento"] / maximos["agotamiento"] * 100) if maximos["agotamiento"] > 0 else 0.0
    score_cinismo = (puntos["cinismo"] / maximos["cinismo"] * 100) if maximos["cinismo"] > 0 else 0.0
    score_eficacia_real = (puntos["eficacia"] / maximos["eficacia"] * 100) if maximos["eficacia"] > 0 else 0.0

    # Si la IA detectó burnout, sumamos el peso de ajuste de manera controlada (máximo 100%)
    if peso_ia_burnout > 0:
        score_agotamiento = min(100.0, score_agotamiento + peso_ia_burnout)
        score_cinismo = min(100.0, score_cinismo + (peso_ia_burnout / 2))
        score_eficacia_real = max(0.0, score_eficacia_real - (peso_ia_burnout / 2))

    # Definición de niveles clínicos de Alerta
    alerta = "Bajo"
    indicadores_riesgo = 0

    if score_estres >= 70: indicadores_riesgo += 1
    if score_ansiedad >= 70: indicadores_riesgo += 1
    if score_agotamiento >= 70: indicadores_riesgo += 1
    if score_cinismo >= 70: indicadores_riesgo += 1
    if score_eficacia_real <= 35 and maximos["eficacia"] > 0: indicadores_riesgo += 1

    if indicadores_riesgo >= 2:
        alerta = "Alto"
    elif indicadores_riesgo == 1 or score_estres >= 50 or score_ansiedad >= 50:
        alerta = "Moderado"

    if alerta == "Bajo":
        conclusion = "Tus respuestas reflejan un adecuado equilibrio psicoemocional. Tus estrategias de afrontamiento y tu percepción de eficacia te permiten gestionar las responsabilidades académicas de manera saludable."
    elif alerta == "Moderado":
        conclusion = "Se observan indicadores moderados de tensión acumulada o desgaste académico. Es aconsejable implementar pausas activas y organizar tus tiempos para prevenir que aumente el agotamiento."
    else:
        conclusion = "Se detectan niveles elevados de sobrecarga y desgaste emocional acumulado. Te sugerimos acudir preventivamente al departamento psicopedagógico de tu facultad para recibir orientación profesional."

    return {
        "estres": round(score_estres, 1),
        "ansiedad": round(score_ansiedad, 1),
        "agotamiento": round(score_agotamiento, 1),
        "cinismo": round(score_cinismo, 1),
        "eficacia": round(score_eficacia_real, 1),
        "conclusion": conclusion,
        "nivel_alerta": alerta,
        "rpta_estres": " | ".join(textos_libres["estres"]),
        "rpta_ansiedad": " | ".join(textos_libres["ansiedad"]),
        "rpta_agotamiento": " | ".join(textos_libres["agotamiento"]),
        "rpta_cinismo": " | ".join(textos_libres["cinismo"]),
        "rpta_eficacia": " | ".join(textos_libres["eficacia"])
    }


# ==========================================
# ENVÍO SEGURO DE REGISTROS A SHEETS (vía Apps Script)
# ==========================================
@app.post("/guardar-diagnostico")
def guardar_diagnostico(data: DiagnosticoGuardar):
    """Enruta y consolida los datos guardándolos en Google Sheets."""
    datos_dict = data.model_dump() if hasattr(data, "model_dump") else data.dict()
    resultado = enviar_a_sheets(datos_dict)
    return resultado

@app.post("/guardar-satisfaccion")
def guardar_satisfaccion(data: SatisfaccionGuardar):
    """Enruta la encuesta de satisfacción hacia Google Sheets."""
    datos_dict = data.model_dump() if hasattr(data, "model_dump") else data.dict()
    resultado = enviar_a_sheets(datos_dict)
    return resultado

@app.get("/metricas-dashboard")
def metricas_dashboard():
    """Lee y entrega las métricas globales para alimentar tu panel."""
    return obtener_metricas_sheets()

# Montaje condicional de estáticos para evitar que falle si la carpeta "frontend" no existe localmente
ruta_frontend = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if not os.path.exists(ruta_frontend):
    ruta_frontend = os.path.join(os.path.dirname(__file__), "frontend")

if os.path.exists(ruta_frontend):
    app.mount("/", StaticFiles(directory=ruta_frontend, html=True), name="frontend")
else:
    print(f"⚠️ Advertencia: No se encontró la carpeta estática en {ruta_frontend}. Iniciando solo como API.")