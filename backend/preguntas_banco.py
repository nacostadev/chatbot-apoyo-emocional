import random

BANCO_PREGUNTAS_POOL = {
    "inicio": [
        "¿Cómo describirías tu estado de ánimo general con la universidad estos días?",
        "Cuéntame brevemente, ¿cómo te ha ido lidiando con la carga académica últimamente?",
        "¿Cómo te has sentido mentalmente con tus cursos en estas últimas semanas?",
        "En pocas palabras, ¿cómo calificarías tu bienestar emocional en la universidad hoy?",
        "¿Qué tal estás manejando las exigencias de tus clases actualmente? Cuéntame.",
        "¿Cómo te va con la presión universitaria en este ciclo? Descríbelo brevemente."
    ],
    "ansiedad_frecuencia": [
        "¿Qué tan seguido te sientes tenso/a, inquieto/a o con los nervios de punta?",
        "¿Con qué frecuencia experimentas un miedo repentino o temor sin causa aparente?",
        "¿Qué tan habitualmente sientes que te preocupas demasiado por cosas sin importancia?",
        "¿Qué tan seguido te cuesta mucho trabajo quedarte tranquilo/a en un solo lugar?",
        "¿Con qué frecuencia sientes una sensación de pánico o alarma inminente?",
        "¿Qué tan seguido te descubres sobrepensando los peores escenarios posibles?",
        "¿Qué tan frecuentemente te sientes abrumado/a por pensamientos catastróficos?",
        "¿Con qué frecuencia te cuesta concentrarte debido a la intranquilidad mental?"
    ],
    "ansiedad_profunda": [
        "Cuando estás muy angustiado/a, ¿qué malestares físicos como taquicardia o temblores notas?",
        "¿Cómo afecta la preocupación constante a tu capacidad para conciliar el sueño?",
        "¿Qué pasa por tu mente cuando sientes que pierdes el control por completo?",
        "Descríbeme qué sientes en el cuerpo (pecho, respiración) cuando el miedo te invade.",
        "¿De qué manera la sensación de alerta interfiere con tus actividades diarias en el aula?",
        "¿Cómo reaccionas cuando una situación imprevista te genera un pico alto de angustia?",
        "¿Qué pensamientos recurrentes no te dejan descansar cuando estás bajo mucha presión?",
        "¿Cómo te limita la ansiedad al momento de interactuar o exponer frente a otros?"
    ],
    "estres_frecuencia": [
        "¿Con qué frecuencia sientes que las demandas de los cursos superan tu tiempo?",
        "¿Qué tan seguido sientes que se acumulan tantas responsabilidades que no sabes qué hacer?",
        "¿Con qué frecuencia te sientes irritable o de mal genio por la presión académica?",
        "¿Qué tan habitualmente sientes que no tienes el control sobre tus tareas diarias?",
        "¿Con qué frecuencia experimentas dolores de cabeza o musculares por la tensión de estudiar?",
        "¿Qué tan seguido sientes que el día no te alcanza para cumplir con la universidad?",
        "¿Con qué frecuencia te cuesta desconectarte de los deberes académicos en tus horas libres?",
        "¿Qué tan seguido te sientes presionado/a por las fechas de entrega de tus trabajos?"
    ],
    "estres_profunda": [
        "¿Qué situaciones específicas con tus docentes o compañeros te alteran o estresan más?",
        "¿De qué forma el exceso de tareas pendientes está impactando en tus relaciones o salud?",
        "¿Cómo manejas la frustración cuando un resultado académico no sale como esperabas?",
        "Cuéntame qué estrategias usas o cómo reaccionas cuando colapsas por sobrecarga de deberes.",
        "¿Qué es lo que más te genera tensión o malestar físico durante la semana de exámenes?",
        "¿Cómo describirías el ambiente de tu facultad respecto a la presión que ejercen?",
        "¿Qué cambios notas en tu paciencia o humor cuando estás sumamente recargado/a?",
        "¿De qué manera el estrés académico afecta tu rendimiento en los trabajos grupales?"
    ],
    "burnout_frecuencia": [
        "¿Con qué frecuencia te despiertas sin energía y sintiendo un cansancio mental absoluto?",
        "¿Qué tan seguido sientes que tu carrera ya no te entusiasma como al principio?",
        "¿Con qué frecuencia te sientes emocionalmente agotado/a al terminar el día universitario?",
        "¿Qué tan habitualmente te cuesta encontrar motivación para asistir a tus clases?",
        "¿Con qué frecuencia sientes que tus metas académicas han perdido el sentido?",
        "¿Qué tan seguido experimentas una sensación de ineficacia o de no dar la talla?",
        "¿Con qué frecuencia te sientes distante o indiferente hacia tus responsabilidades?",
        "¿Qué tan seguido sientes que el esfuerzo que haces en la universidad no vale la pena?"
    ],
    "burnout_profunda": [
        "¿Por qué razones sientes que has perdido el interés o las ganas de seguir estudiando?",
        "¿Cómo describirías este vacío o falta de energía mental que experimentas con tu carrera?",
        "¿De qué manera este agotamiento extremo está afectando tus planes de vida a futuro?",
        "¿Cuándo empezaste a notar que el entusiasmo por tu profesión se convirtió en frustración?",
        "¿Cómo manejas el desinterés o la apatía cuando tienes que estudiar algo importante?",
        "¿Qué es lo que más te desconecta emocionalmente de tus actividades en la UCV?",
        "¿Cómo impacta este cansancio crónico en tu autoestima o confianza como estudiante?",
        "Cuéntame qué sientes al pensar en todo el camino que aún te falta para graduarte."
    ]
}


def obtener_pregunta_aleatoria(clave_categoria, preguntas_vistas=None):
    """Devuelve un reactivo aleatorio de la lista excluyendo estrictamente los ya mostrados"""
    if preguntas_vistas is None:
        preguntas_vistas = []
        
    pool = BANCO_PREGUNTAS_POOL.get(clave_categoria, BANCO_PREGUNTAS_POOL["estres_frecuencia"])
    
    pool_disponible = [p for p in pool if p not in preguntas_vistas]
    
    if not pool_disponible:
        pool_disponible = pool
        
    return random.choice(pool_disponible)