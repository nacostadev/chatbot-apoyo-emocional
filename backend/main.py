import os
import joblib
import random
import sys
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

ruta_raiz = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ruta_raiz not in sys.path:
    sys.path.insert(0, ruta_raiz)

from backend.preguntas_banco import obtener_pregunta_aleatoria
from backend.sheets_service import enviar_a_sheets, obtener_metricas_sheets

app = FastAPI(title="API UCV")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ruta_modelo = os.path.join("backend", "model", "modelo_emocional.pkl")
ruta_vectorizador = os.path.join("backend", "model", "vectorizador_texto.pkl")

modelo_ia = joblib.load(ruta_modelo) if os.path.exists(ruta_modelo) else None
vectorizador = joblib.load(ruta_vectorizador) if os.path.exists(ruta_vectorizador) else None

MAPEO_OPCIONES_TEXTO = {
    0: "nunca siento este malestar todo en orden",
    1: "varios días presento leve preocupación intermitente",
    2: "más de la mitad de los días afecta mi rutina",
    3: "casi todos los días es severo y crítico"
}

def generar_feedback_empatico(respuesta: str, prediccion_semantica: str, proxima_pregunta_clave: str) -> str:
    if respuesta.isdigit():
        val = int(respuesta)
        if "profunda" in proxima_pregunta_clave:
            opciones_profundas = [
                "Lamento mucho escuchar que esto te afecte de forma recurrente. Para poder comprender mejor tu situación, ¿podrías detallarme un poco más cómo experimentas este aspecto?",
                "Veo que es algo que se presenta bastante en tu rutina. Valoro tu sinceridad; por favor, cuéntame un poco más detalladamente sobre esto.",
                "Sé que lidiar con esta frecuencia no es sencillo. Me gustaría que me describieras con tus propias palabras qué experimentas en estas situaciones.",
                "Gracias por compartir la frecuencia. Al ser un aspecto recurrente, me ayudaría mucho si pudieras detallarme un poco más esta experiencia."
            ]
            return random.choice(opciones_profundas)
            
        if val == 0:
            opciones = [
                "Me alegra saber que no experimentas esta molestia con frecuencia. Sigamos evaluando otras áreas.",
                "Qué buena noticia que no sea un problema recurrente para ti. Avancemos al siguiente indicador.",
                "Excelente. Continuemos explorando otros factores de tu bienestar universitario.",
                "Entendido. Qué positivo saberlo. Sigamos con la evaluación."
            ]
            return random.choice(opciones)
        elif val == 1:
            opciones = [
                "Entiendo. A veces estos sentimientos aparecen de forma ocasional o intermitente. Continuemos.",
                "Comprendo que se presente de manera esporádica. Evaluemos la siguiente dimensión.",
                "De acuerdo. Tomamos nota de esta frecuencia leve y seguimos adelante.",
                "Gracias por responder. Sigamos analizando otros aspectos de tu bienestar."
            ]
            return random.choice(opciones)
        elif val == 2:
            opciones = [
                "Entiendo. Que se presente más de la mitad de los días ya empieza a ser desgastante. Sigamos evaluando.",
                "Comprendo que es una presencia constante en tu semana. Sigamos adelante con la evaluación.",
                "Gracias por compartirlo. Mapear la persistencia de este malestar es clave. Continuemos.",
                "Entendido. Tomamos nota de que es una molestia frecuente. Sigamos con el siguiente criterio."
            ]
            return random.choice(opciones)
        else: # val == 3
            opciones = [
                "Lamento mucho que pases por esto casi a diario. Debe ser muy agotador. Sigamos evaluando para comprender todo tu panorama.",
                "Eso suena sumamente retador y desgastante. Valoro mucho tu sinceridad. Continuemos adelante.",
                "Siento que experimentes esta carga de forma tan constante. Avancemos al siguiente indicador clave.",
                "Lamento que esta situación sea tan persistente. Sigamos con las preguntas para mapear bien tu bienestar."
            ]
            return random.choice(opciones)
            
    # 2. Si es respuesta de texto libre
    respuesta_normalizada = respuesta.lower().strip()
    
    # Palabras clave de alta intensidad emocional
    palabras_criticas = ["morir", "colapso", "llorar", "asfixia", "pánico", "pecho", "desesperación", "desesperado", "auxilio", "ayuda", "soledad", "llorando"]
    if any(w in respuesta_normalizada for w in palabras_criticas):
        return "Noto una carga emocional muy intensa y difícil en tu respuesta. Valoro enormemente tu sinceridad y valentía al expresarlo. Continuemos con mucho cuidado."
        
    # Palabras clave de sueño/descanso
    palabras_descanso = ["dormir", "sueño", "desvelo", "despierto", "cansancio", "insomnio", "fatiga", "agotado", "sin fuerzas", "cansada", "cansado"]
    if any(w in respuesta_normalizada for w in palabras_descanso):
        return "Registrando el impacto en tu descanso y energía. No dormir bien o sentir cansancio constante influye mucho en cómo nos sentimos mentalmente. Evaluemos a fondo."

    # Palabras de motivación/aprendizaje/positivas
    palabras_positivas = ["bien", "tranquilo", "motivado", "aprender", "feliz", "estable", "optimista", "ganas", "entusiasmado", "contento", "excelente", "mejor", "ánimo", "animo"]
    if any(w in respuesta_normalizada for w in palabras_positivas):
        return "¡Qué bueno leer eso! Me alegra mucho que comiences con una actitud positiva y con buena disposición. Sigamos adelante con la evaluación."

    # Palabras de carga académica
    palabras_academicas = ["examen", "exámenes", "tarea", "tareas", "curso", "cursos", "profesor", "profesores", "docente", "universidad", "carga", "estudiar", "presión", "clases", "parciales", "finales", "exposiciones"]
    if any(w in respuesta_normalizada for w in palabras_academicas):
        return "La carga académica y las responsabilidades en la universidad suelen generar gran presión. Comprendo perfectamente tu sentir, continuemos indagando."

    # Si no coincide con palabras específicas, usamos la predicción del modelo de IA (ansiedad, estres, burnout)
    if prediccion_semantica == "ansiedad":
        return "Entiendo que esa intranquilidad o ansiedad puede ser muy abrumadora en el día a día. Vamos a profundizar en ello con la siguiente pregunta."
    elif prediccion_semantica == "estres" or prediccion_semantica == "estrés":
        return "La tensión y el estrés acumulados se sienten pesados. Valoro que compartas estos detalles para poder mapear bien tu situación. Continuemos."
    elif prediccion_semantica == "burnout":
        return "Sentir ese desgaste o falta de motivación extrema con los estudios es muy difícil. Sigamos con la evaluación para comprender este cansancio académico."
        
    # Feedback por defecto para texto libre
    return "Agradezco mucho que compartas cómo te sientes con ese nivel de detalle. Sigamos con la siguiente pregunta."

class TurnoChat(BaseModel):
    indice_pregunta: int
    valor_respuesta: str
    historial_categorias: List[str]
    historial_preguntas_text: Optional[List[str]] = [] 

class EvaluacionFinal(BaseModel):
    respuestas_valores: List[str]
    tipos_preguntas: List[str]
    categorias_respondidas: List[str]

# ============================
# Modelos para guardar en Google Sheets
# ============================
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
    FlujoTipo: str = "SATISFACCION_USUARIO"
    Fecha: str
    Estudiante: str
    Facultad: str
    ClaridadPreguntas: int
    CoherenciaBot: int
    SugerenciaComentario: str

@app.get("/primera-pregunta")
def obtener_primera_pregunta():
    proxima_pregunta_clave = "ansiedad_frecuencia"
    texto_inicio = obtener_pregunta_aleatoria(proxima_pregunta_clave)
    return {
        "finalizado": False,
        "indice_siguiente": 1,
        "tipo": "opciones",
        "pregunta": texto_inicio,
        "categoria": proxima_pregunta_clave,
        "feedback_bot": "¡Hola! Comencemos la evaluación."
    }

@app.post("/procesar-turno")
def procesar_turno(data: TurnoChat):
    respuesta = data.valor_respuesta.lower().strip()
    turno_actual = data.indice_pregunta
    
    if turno_actual >= 16:
        return {"finalizado": True, "indice_siguiente": turno_actual, "tipo": "", "pregunta": "", "categoria": "", "feedback_bot": ""}

    prediccion_semantica = "general"

    if not respuesta.isdigit() and len(respuesta) > 4:
        if modelo_ia and vectorizador:
            texto_tfidf = vectorizador.transform([respuesta])
            pred_raw = str(modelo_ia.predict(texto_tfidf)[0]).lower()
            if "ansiedad" in pred_raw: prediccion_semantica = "ansiedad"
            elif "estres" in pred_raw or "estrés" in pred_raw: prediccion_semantica = "estres"
            elif "burnout" in pred_raw or "agotamiento" in pred_raw: prediccion_semantica = "agotamiento"

    categorias_visitadas = [c for c in data.historial_categorias if c != "general"]
    
    # Extraemos las dimensiones base ya visitadas
    dimensiones_visitadas = set()
    for cat in categorias_visitadas:
        for d in ["ansiedad", "estres", "agotamiento", "cinismo", "eficacia"]:
            if d in cat:
                dimensiones_visitadas.add(d)

    dimensiones_faltantes = [d for d in ["ansiedad", "estres", "agotamiento", "cinismo", "eficacia"] if d not in dimensiones_visitadas]
    siguiente_dimension = dimensiones_faltantes[0] if dimensiones_faltantes else "ansiedad"

    # 10 preguntas en total para mantener el patrón híbrido estricto (5 dimensiones x 2 preguntas c/u)
    if len(categorias_visitadas) >= 10:
        return {"finalizado": True, "indice_siguiente": turno_actual, "tipo": "", "pregunta": "", "categoria": "", "feedback_bot": ""}

    tipo_pregunta = "opciones"

    if not categorias_visitadas:
        # Primera pregunta: frecuencia (marcar)
        proxima_pregunta_clave = f"{siguiente_dimension}_frecuencia"
    else:
        ultima_cat = categorias_visitadas[-1]
        base_ultima_cat = "ansiedad"
        for d in ["ansiedad", "estres", "agotamiento", "cinismo", "eficacia"]:
            if d in ultima_cat:
                base_ultima_cat = d
                break
        
        # Si la última pregunta fue 'frecuencia', la siguiente debe ser obligatoriamente 'profunda' (escribir)
        if "frecuencia" in ultima_cat:
            proxima_pregunta_clave = f"{base_ultima_cat}_profunda"
            tipo_pregunta = "texto_libre"
        # Si la última fue 'profunda', pasamos a la siguiente dimensión con 'frecuencia' (marcar)
        else:
            if not dimensiones_faltantes:
                 return {"finalizado": True, "indice_siguiente": turno_actual, "tipo": "", "pregunta": "", "categoria": "", "feedback_bot": ""}
            proxima_pregunta_clave = f"{dimensiones_faltantes[0]}_frecuencia"
            tipo_pregunta = "opciones"

    if proxima_pregunta_clave in categorias_visitadas and dimensiones_faltantes:
        proxima_pregunta_clave = f"{dimensiones_faltantes[0]}_frecuencia"

    if "profunda" in proxima_pregunta_clave:
        tipo_pregunta = "texto_libre"

    # Generar feedback dinámico y empático
    feedback_bot = generar_feedback_empatico(data.valor_respuesta, prediccion_semantica, proxima_pregunta_clave)

    texto_final_pregunta = obtener_pregunta_aleatoria(proxima_pregunta_clave, data.historial_preguntas_text)

    return {
        "finalizado": False,
        "indice_siguiente": turno_actual + 1,
        "tipo": tipo_pregunta,
        "pregunta": texto_final_pregunta,
        "categoria": proxima_pregunta_clave,
        "feedback_bot": feedback_bot
    }


@app.post("/diagnostico-final")
def generar_diagnostico_final(data: EvaluacionFinal):
    CATEGORIAS = ["ansiedad", "estres", "agotamiento", "cinismo", "eficacia"]

    # Inicializar contadores de opciones para cada categoría
    sum_opciones = {c: 0 for c in CATEGORIAS}
    cant_opciones = {c: 0 for c in CATEGORIAS}

    # Almacenar textos libres por categoría para análisis selectivo por NLP
    textos_libres = {c: [] for c in CATEGORIAS}
    textos_libres["general"] = []

    # Procesar las respuestas recibidas
    for valor, tipo, cat in zip(data.respuestas_valores, data.tipos_preguntas, data.categorias_respondidas):
        base_cat = "ansiedad"
        if "estres" in cat:
            base_cat = "estres"
        elif "agotamiento" in cat:
            base_cat = "agotamiento"
        elif "cinismo" in cat:
            base_cat = "cinismo"
        elif "eficacia" in cat:
            base_cat = "eficacia"

        if tipo == "opciones":
            val_int = int(valor) if valor.isdigit() else 0
            sum_opciones[base_cat] += val_int
            cant_opciones[base_cat] += 1
        else:
            textos_libres[base_cat].append(valor.strip())

    # Calcular puntaje base porcentual a partir de opciones múltiples (0 a 3 mapeado de 0% a 100%)
    scores = {}
    for cat in CATEGORIAS:
        if cant_opciones[cat] > 0:
            scores[cat] = (sum_opciones[cat] / (cant_opciones[cat] * 3.0)) * 100.0
        else:
            scores[cat] = 0.0

    # Inicializar y acumular bonificaciones de análisis de texto (NLP)
    nlp_bonuses = {c: 0.0 for c in CATEGORIAS}

    palabras_clave = {
        "ansiedad": ["ansiedad", "inquieto", "inquietud", "pánico", "asfixia", "nervios", "pecho", "taquicardia", "temblor", "miedo", "angustia"],
        "estres": ["estrés", "estres", "presión", "presion", "carga", "exámenes", "examen", "colapso", "frustración", "frustracion", "irritable"],
        "agotamiento": ["agotado", "agotada", "cansancio", "sin fuerzas", "exhausto", "exhausta", "fatiga", "desgastado", "desgastada"],
        "cinismo": ["cinismo", "indiferente", "desconectado", "desconectada", "no me importa", "distancia", "desapego", "apatía", "apatia"],
        "eficacia": ["ineficaz", "inútil", "inutil", "no sirvo", "incapaz", "fracaso", "no logro", "no puedo con esto"]
    }

    # Analizar de manera exclusiva las respuestas de texto libre
    for cat, textos in textos_libres.items():
        for texto in textos:
            if len(texto) > 3:
                texto_normalizado = texto.lower()

                for clave, palabras in palabras_clave.items():
                    if any(w in texto_normalizado for w in palabras):
                        nlp_bonuses[clave] += 10.0

                # Predicción del modelo de Machine Learning (solo si está cargado)
                # Nota: el modelo fue entrenado con 3 clases (ansiedad/estres/burnout).
                # La bonificación de "burnout" se aplica a Agotamiento como aproximación
                # hasta reentrenar el modelo con las 3 subescalas nuevas.
                if modelo_ia and vectorizador:
                    texto_tfidf = vectorizador.transform([texto])
                    prediccion_ia = str(modelo_ia.predict(texto_tfidf)[0]).lower()

                    if "ansiedad" in prediccion_ia:
                        nlp_bonuses["ansiedad"] += 15.0
                    elif "estres" in prediccion_ia or "estrés" in prediccion_ia:
                        nlp_bonuses["estres"] += 15.0
                    elif "burnout" in prediccion_ia:
                        nlp_bonuses["agotamiento"] += 15.0

    score_ansiedad = min(100.0, max(0.0, scores["ansiedad"] + nlp_bonuses["ansiedad"]))
    score_estres = min(100.0, max(0.0, scores["estres"] + nlp_bonuses["estres"]))
    score_agotamiento = min(100.0, max(0.0, scores["agotamiento"] + nlp_bonuses["agotamiento"]))
    score_cinismo = min(100.0, max(0.0, scores["cinismo"] + nlp_bonuses["cinismo"]))

    score_eficacia = min(100.0, max(0.0, scores["eficacia"] + nlp_bonuses["eficacia"]))
    riesgo_por_baja_eficacia = 100.0 - score_eficacia

    puntajes_riesgo = {
        "ansiedad": score_ansiedad,
        "estres": score_estres,
        "agotamiento": score_agotamiento,
        "cinismo": score_cinismo,
        "eficacia": riesgo_por_baja_eficacia
    }
    dimension_max = max(puntajes_riesgo, key=puntajes_riesgo.get)
    max_score = puntajes_riesgo[dimension_max]

    if max_score < 35.0:
        conclusion = "El análisis multivariable indica estabilidad emocional óptima (Buen estado / Estable) dentro de los rangos normales."
        alerta = "Bajo"
    elif max_score < 60.0:
        conclusion = "Se observan niveles moderados de carga emocional. Se recomienda seguimiento y prácticas de autocuidado para prevenir el incremento del malestar."
        alerta = "Moderado"
    else:
        alerta = "Alto / Crítico"
        conclusiones_criticas = {
            "ansiedad": "Se identifican manifestaciones compatibles con Ansiedad Universitaria severa. Se sugiere asistencia psicológica para orientación.",
            "estres": "Los indicadores convergen en niveles elevados de Estrés Académico. Se recomienda reestructurar cargas académicas y organizativas.",
            "agotamiento": "La narrativa y los patrones de frecuencia denotan presencia severa de Agotamiento Emocional, afectando críticamente la energía y motivación.",
            "cinismo": "Se observan niveles elevados de Cinismo/Despersonalización hacia los estudios, con distanciamiento emocional respecto a las responsabilidades académicas.",
            "eficacia": "Se detecta una baja Eficacia Académica Percibida, con sensación marcada de incompetencia o falta de logro en el desempeño estudiantil."
        }
        conclusion = conclusiones_criticas[dimension_max]

    # Consolidar todos los textos libres para el retorno
    lista_textos_libres = [t for textos in textos_libres.values() for t in textos if t]

    return {
        "ansiedad": round(score_ansiedad, 1),
        "estres": round(score_estres, 1),
        "agotamiento": round(score_agotamiento, 1),
        "cinismo": round(score_cinismo, 1),
        "eficacia": round(score_eficacia, 1),
        "conclusion": conclusion,
        "nivel_alerta": alerta,
        "texto_consolidado_procesado": " | ".join(lista_textos_libres)
    }


# ============================
# ENDPOINTS: Conexión con Google Sheets (vía Apps Script)
# ============================
@app.post("/guardar-diagnostico")
def guardar_diagnostico(data: DiagnosticoGuardar):
    """El frontend llama a esto en vez de golpear Google Apps Script directamente."""
    resultado = enviar_a_sheets(data.dict())
    return resultado

@app.post("/guardar-satisfaccion")
def guardar_satisfaccion(data: SatisfaccionGuardar):
    """El frontend llama a esto en vez de golpear Google Apps Script directamente."""
    resultado = enviar_a_sheets(data.dict())
    return resultado

@app.get("/metricas-dashboard")
def metricas_dashboard():
    """El dashboard llama a esto para leer los datos reales del Google Sheet."""
    return obtener_metricas_sheets()


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")