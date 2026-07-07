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
from backend.preguntas_banco import obtener_pregunta_aleatoria

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

@app.get("/primera-pregunta")
def obtener_primera_pregunta():
    texto_inicio = obtener_pregunta_aleatoria("inicio")
    return {
        "finalizado": False,
        "indice_siguiente": 1,
        "tipo": "texto_libre",
        "pregunta": texto_inicio,
        "categoria": "general",
        "feedback_bot": "¡Hola! Comencemos el análisis adaptativo."
    }

@app.post("/procesar-turno")
def procesar_turno(data: TurnoChat):
    respuesta = data.valor_respuesta.lower().strip()
    turno_actual = data.indice_pregunta
    
    if turno_actual >= 10:
        return {"finalizado": True, "indice_siguiente": turno_actual, "tipo": "", "pregunta": "", "categoria": "", "feedback_bot": ""}

    prediccion_semantica = "general"

    if not respuesta.isdigit() and len(respuesta) > 4:
        if modelo_ia and vectorizador:
            texto_tfidf = vectorizador.transform([respuesta])
            pred_raw = str(modelo_ia.predict(texto_tfidf)[0]).lower()
            if "ansiedad" in pred_raw: prediccion_semantica = "ansiedad"
            elif "estres" in pred_raw or "estrés" in pred_raw: prediccion_semantica = "estres"
            elif "burnout" in pred_raw: prediccion_semantica = "burnout"

    categorias_visitadas = [c for c in data.historial_categorias if c != "general"]
    dimensiones_faltantes = [d for d in ["ansiedad", "estres", "burnout"] if d not in categorias_visitadas]
    siguiente_dimension = dimensiones_faltantes[0] if dimensiones_faltantes else "ansiedad"

    tipo_pregunta = "opciones"

    if turno_actual == 1 or "general" in data.historial_categorias:
        if prediccion_semantica in dimensiones_faltantes:
            siguiente_dimension = prediccion_semantica
        proxima_pregunta_clave = f"{siguiente_dimension}_frecuencia"
    else:
        ultima_cat = data.historial_categorias[-1] if data.historial_categorias else "ansiedad"
        
        if respuesta.isdigit(): 
            val = int(respuesta)
            if val >= 2 and f"{ultima_cat}_profunda" not in categorias_visitadas:
                proxima_pregunta_clave = f"{ultima_cat}_profunda"
                tipo_pregunta = "texto_libre"
            else:
                proxima_pregunta_clave = f"{siguiente_dimension}_frecuencia"
        else:
            proxima_pregunta_clave = f"{siguiente_dimension}_frecuencia"

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
    # Inicializar contadores de opciones para cada categoría
    sum_opciones = {"ansiedad": 0, "estres": 0, "burnout": 0}
    cant_opciones = {"ansiedad": 0, "estres": 0, "burnout": 0}
    
    # Almacenar textos libres por categoría para análisis selectivo por NLP
    textos_libres = {"ansiedad": [], "estres": [], "burnout": [], "general": []}
    
    # Procesar las respuestas recibidas
    for valor, tipo, cat in zip(data.respuestas_valores, data.tipos_preguntas, data.categorias_respondidas):
        base_cat = "ansiedad"
        if "estres" in cat:
            base_cat = "estres"
        elif "burnout" in cat:
            base_cat = "burnout"
            
        if tipo == "opciones":
            val_int = int(valor) if valor.isdigit() else 0
            sum_opciones[base_cat] += val_int
            cant_opciones[base_cat] += 1
        else:
            textos_libres[base_cat].append(valor.strip())
            
    # Calcular puntaje base porcentual a partir de opciones múltiples (0 a 3 mapeado de 0% a 100%)
    scores = {}
    for cat in ["ansiedad", "estres", "burnout"]:
        if cant_opciones[cat] > 0:
            scores[cat] = (sum_opciones[cat] / (cant_opciones[cat] * 3.0)) * 100.0
        else:
            scores[cat] = 0.0

    # Inicializar y acumular bonificaciones de análisis de texto (NLP)
    nlp_bonuses = {"ansiedad": 0.0, "estres": 0.0, "burnout": 0.0}
    
    # Analizar de manera exclusiva las respuestas de texto libre
    for cat, textos in textos_libres.items():
        for texto in textos:
            if len(texto) > 3:
                texto_normalizado = texto.lower()
                
                # Búsqueda de palabras clave emocionales
                palabras_ansiedad = ["ansiedad", "inquieto", "inquietud", "pánico", "asfixia", "nervios", "pecho", "taquicardia", "temblor", "miedo", "angustia"]
                palabras_estres = ["estrés", "estres", "presión", "presion", "carga", "exámenes", "examen", "colapso", "frustración", "frustracion", "irritable"]
                palabras_burnout = ["burnout", "agotado", "agotada", "cansancio", "sin fuerzas", "desmotivado", "desmotivada", "vacío", "vacio", "apatía", "apatia"]
                
                if any(w in texto_normalizado for w in palabras_ansiedad):
                    nlp_bonuses["ansiedad"] += 10.0
                if any(w in texto_normalizado for w in palabras_estres):
                    nlp_bonuses["estres"] += 10.0
                if any(w in texto_normalizado for w in palabras_burnout):
                    nlp_bonuses["burnout"] += 10.0
                
                # Predicción del modelo de Machine Learning (solo si está cargado)
                if modelo_ia and vectorizador:
                    texto_tfidf = vectorizador.transform([texto])
                    prediccion_ia = str(modelo_ia.predict(texto_tfidf)[0]).lower()
                    
                    if "ansiedad" in prediccion_ia:
                        nlp_bonuses["ansiedad"] += 15.0
                    elif "estres" in prediccion_ia or "estrés" in prediccion_ia:
                        nlp_bonuses["estres"] += 15.0
                    elif "burnout" in prediccion_ia:
                        nlp_bonuses["burnout"] += 15.0

    # Sumar bonificaciones de NLP y acotar el puntaje final en el rango [0, 100]
    score_ansiedad = min(100.0, max(0.0, scores["ansiedad"] + nlp_bonuses["ansiedad"]))
    score_estres = min(100.0, max(0.0, scores["estres"] + nlp_bonuses["estres"]))
    score_burnout = min(100.0, max(0.0, scores["burnout"] + nlp_bonuses["burnout"]))
    
    # Determinar el nivel de alerta y conclusión clínica basado en el score máximo obtenido
    max_score = max(score_ansiedad, score_estres, score_burnout)
    
    if max_score < 35.0:
        conclusion = "El análisis multivariable indica estabilidad emocional óptima (Buen estado / Estable) dentro de los rangos normales."
        alerta = "Bajo"
    elif max_score < 60.0:
        conclusion = "Se observan niveles moderados de carga emocional. Se recomienda seguimiento y prácticas de autocuidado para prevenir el incremento del malestar."
        alerta = "Moderado"
    else:
        alerta = "Alto / Crítico"
        if max_score == score_ansiedad:
            conclusion = "Se identifican manifestaciones compatibles con Ansiedad Universitaria severa. Se sugiere asistencia psicológica para orientación."
        elif max_score == score_estres:
            conclusion = "Los indicadores convergen en niveles elevados de Estrés Académico. Se recomienda reestructurar cargas académicas y organizativas."
        else:
            conclusion = "La narrativa y los patrones de frecuencia denotan presencia severa de Burnout Estudiantil, afectando críticamente la motivación intrínseca."

    # Consolidar todos los textos libres para el retorno
    lista_textos_libres = [t for textos in textos_libres.values() for t in textos if t]

    return {
        "estres": round(score_estres, 1),
        "ansiedad": round(score_ansiedad, 1),
        "burnout": round(score_burnout, 1),
        "conclusion": conclusion,
        "nivel_alerta": alerta,
        "texto_consolidado_procesado": " | ".join(lista_textos_libres)
    }

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")