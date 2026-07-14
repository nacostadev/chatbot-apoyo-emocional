import random

BANCO_PREGUNTAS_POOL = {
    "inicio": [
        "Para comenzar nuestra sesión, ¿cómo describirías tu estado de ánimo general y tu nivel de motivación al enfrentarte a la rutina de la universidad en estos últimos días?",
        "Cuéntame detalladamente cómo te ha ido lidiando con la carga de trabajos, exposiciones y exámenes últimamente. ¿Sientes que mantienes el control o te cuesta organizarte?",
        "¿De qué manera te has sentido mental, física y emocionalmente con las exigencias de tus cursos en estas últimas semanas de ciclo académico?",
        "En tus propias palabras, ¿cómo calificarías tu bienestar emocional universitario hoy en día? Piensa en el balance entre tu vida académica y tu vida personal.",
        "¿Qué tal estás manejando las demandas de tus clases presenciales o virtuales en este momento? Cuéntame qué aspectos de la rutina te resultan más sencillos o complejos.",
        "¿Cómo te va lidiando con la presión típica de la vida universitaria en este periodo de tu carrera? Descríbelo brevemente enfocándote en tus sensaciones cotidianas.",
        "Haciendo un balance general de tu semana, ¿cuáles han sido los momentos más desafiantes o desgastantes que has tenido que afrontar en tu rol como estudiante?",
        "Si pudieras resumir tu experiencia universitaria de este último mes en una sola frase o metáfora, ¿cuál sería y qué emociones refleja sobre ti?"
    ],
    "ansiedad_frecuencia": [
        "¿Qué tan seguido en tus semanas de estudio experimentas sensaciones de tensión muscular, inquietud interna o sientes los nervios de punta sin una razón académica clara?",
        "¿Con qué frecuencia notas que experimentas una sensación repentina de miedo, temor o angustia imprevista que te genera desconfianza al entrar al aula o estudiar?",
        "¿Qué tan habitualmente sientes que tu mente se enfoca y se preocupa de manera excesiva por pequeños detalles, notas o entregas que quizá no son tan graves?",
        "¿Qué tan seguido te cuesta mucho trabajo relajarte, quedarte en paz en un solo lugar o concentrarte en una lectura larga debido a una agitación interna constante?",
        "¿Con qué frecuencia te embarga una sensación persistente de alarma, pánico o la sospecha incómoda de que algo va a salir mal con tus evaluaciones o proyectos?",
        "¿Qué tan seguido te descubres sobrepensando de forma automática los peores escenarios posibles sobre tu futuro académico, imaginando que reprobarás o que no podrás terminar la carrera?",
        "¿Qué tan frecuentemente te sientes abrumado/a por un cúmulo de pensamientos catastróficos que te impiden mantener el enfoque durante tus horas de estudio o clase?",
        "¿Con qué frecuencia sientes que te cuesta un esfuerzo enorme concentrarte en las explicaciones de los docentes debido a un ruido mental o intranquilidad constante?",
        "¿Qué tan seguido te encuentras en un estado de hipervigilancia, sintiendo que cualquier comentario de un profesor o compañero es una señal de que estás haciendo las cosas mal?",
        "¿Con qué frecuencia experimentas una molesta sensación de impaciencia o irritabilidad contigo mismo/a porque sientes que tu mente va más rápido de lo que puedes procesar?"
    ],
    "ansiedad_profunda": [
        "Cuando estás atravesando un momento de mucha angustia académica, ¿qué malestares físicos en tu cuerpo logras identificar con claridad, como taquicardia, sudoración en las manos o temblores?",
        "¿De qué manera esta preocupación constante por tus cursos o tu futuro profesional está afectando tu capacidad para conciliar el sueño o lograr un descanso reparador por las noches?",
        "Describe detalladamente qué pasa por tu mente, qué ideas te invaden y cómo te sientes emocionalmente cuando experimentas la sensación de haber perdido el control por completo de tus deberes.",
        "Cuéntame con tus propias palabras qué experimentas en el pecho o en tu respiración cuando sientes que el miedo al fracaso académico te bloquea a mitad de una clase o examen.",
        "¿De qué manera específica sientes que este estado de alerta y preocupación constante interfiere con tu participación activa en el aula, tu atención o tu rendimiento diario?",
        "¿Cómo sueles reaccionar física y mentalmente cuando un imprevisto académico (como una evaluación sorpresa o un cambio de grupo) genera un pico alto e incontrolable de angustia?",
        "¿Cuáles son esos pensamientos recurrentes que te asaltan por las noches y no te permiten desconectarte de las obligaciones universitarias, incluso cuando ya es hora de dormir?",
        "¿De qué forma sientes que la ansiedad limita tus habilidades sociales, especialmente al momento de interactuar con tus compañeros o al tener que exponer un tema complejo frente al salón?",
        "Cuéntame cómo manejas el autosabotaje intelectual en esos días donde la angustia te hace creer que, por más que estudies, no serás capaz de aprobar tus materias.",
        "¿Qué estrategias de emergencia o recursos personales utilizas cuando sientes que un ataque de pánico o un bloqueo mental severo interrumpe tu jornada de estudio?"
    ],
    "estres_frecuencia": [
        "¿Con qué frecuencia sientes que las demandas de tiempo de tus materias (tareas, lecturas y trabajos grupales) superan por completo las horas reales que tienes disponibles para realizarlas?",
        "¿Qué tan seguido sientes que se acumulan tantas responsabilidades simultáneas que tu mente se bloquea y no sabes por cuál de ellas empezar a trabajar?",
        "¿Con qué frecuencia te notas irritable, impaciente o de mal genio con tu entorno (familia, amigos, compañeros de grupo) debido a la presión del ciclo académico?",
        "¿Qué tan habitualmente experimentas la sensación de que las decisiones importantes y el control sobre tus tareas diarias se te escapan de las manos debido al caos de la universidad?",
        "¿Con qué frecuencia experimentas dolores físicos como tensión en el cuello, dolores de cabeza frecuentes o rigidez en la espalda a causa de las largas horas que dedicas a estudiar bajo presión?",
        "¿Qué tan seguido sientes que las 24 horas del día no son suficientes para poder cumplir con éxito con tus responsabilidades académicas y mantener tu vida personal?",
        "¿Con qué frecuencia te resulta sumamente difícil o casi imposible desconectar tu mente de los pendientes de la universidad en tus momentos de ocio, fines de semana o vacaciones?",
        "¿Qué tan seguido te sientes presionado/a, estresado/a o con el tiempo encima debido a la cercanía de las fechas límite para la entrega de tus proyectos o informes?",
        "¿Con qué frecuencia sientes que el nivel de competencia y comparación constante con tus compañeros de clase se convierte en una fuente adicional de presión insoportable?",
        "¿Qué tan habitualmente sientes que descuidas tus necesidades más básicas (como comer a tus horas, hidratarte o tomar pausas libres) para poder cumplir con todo lo académico?"
    ],
    "estres_profunda": [
        "¿Qué situaciones o dinámicas específicas con tus docentes, delegados o compañeros de equipo son las que más te alteran, estresan o desgastan emocionalmente durante el ciclo?",
        "¿De qué forma consideras que este exceso de tareas y la presión constante por mantener un buen promedio están impactando en tus relaciones interpersonales, tu alimentación o tu salud general?",
        "Cuéntame cómo manejas la frustración interna y qué pensamientos te invaden cuando obtienes un resultado de examen o una calificación en un trabajo que no refleja todo el esfuerzo que invertiste.",
        "Descríbeme qué estrategias utilizas para calmarte o cómo es tu reacción inmediata en esos momentos específicos donde sientes que colapsas y ya no puedes más con la sobrecarga académica.",
        "¿Qué es lo que más te genera malestar físico y tensión mental antes, durante y después de la semana de exámenes parciales o finales de tu facultad?",
        "¿Cómo describirías la exigencia y el ambiente general de tu facultad? ¿Sientes que es un espacio de apoyo mutuo o que la presión que ejercen los docentes es desmedida?",
        "¿Qué cambios específicos notas en tu nivel de paciencia, tu estado de ánimo o tu humor cuando te encuentras sumamente recargado/a de deberes universitarios?",
        "¿De qué manera el estrés académico y la fatiga acumulada terminan afectando tu comunicación, tu empatía y tu rendimiento al momento de realizar trabajos grupales?",
        "Cuéntame en detalle si alguna vez has tenido que postergar actividades recreativas, citas médicas o compromisos familiares importantes única y exclusivamente por cumplir con la universidad.",
        "¿De qué manera crees que la presión por encajar en las expectativas de tus padres, tutores o de ti mismo/a incrementa el estrés que experimentas en el día a día?"
    ],
    "agotamiento_frecuencia": [
        "¿Con qué frecuencia te sientes emocionalmente agotado/a, desgastado/a y con una sensación de vacío profundo debido a las exigencias continuas de tu carrera universitaria?",
        "¿Qué tan seguido experimentas una dificultad extrema para levantarte por las mañanas, sintiendo que no tienes la energía suficiente para enfrentar otro día de clases?",
        "¿Con qué frecuencia te sientes exhausto/a físicamente, sin vitalidad y totalmente drenado/a al terminar tu jornada académica diaria?",
        "¿Qué tan habitualmente sientes que la presión constante de los exámenes y las clases ha consumido por completo tus reservas de energía física y mental?",
        "¿Con qué frecuencia sientes que, aunque duermas las horas suficientes, te despiertas con la misma sensación de fatiga y cansancio mental con la que te acostaste?",
        "¿Qué tan seguido notas que tu cuerpo te pide a gritos un descanso absoluto, pero tu mente te obliga a seguir adelante generándote un desgaste crónico?",
        "¿Con qué frecuencia sientes que tu capacidad para tolerar el esfuerzo mental en lecturas, proyectos o resolución de problemas ha disminuido notablemente debido al cansancio acumulado?",
        "¿Qué tan habitualmente te sientes incapaz de recuperarte del cansancio, incluso después de haber tenido un fin de semana libre o un periodo corto de vacaciones?",
        "¿Con qué frecuencia experimentas fatiga mental extrema a mitad de una clase, sintiendo que tu cerebro simplemente ya no puede procesar más información?",
        "¿Qué tan seguido sientes que tu paciencia y energía para lidiar con los problemas rutinarios de la universidad se han agotado por completo?"
    ],
    "agotamiento_profunda": [
        "Cuéntame detalladamente cómo describirías ese vacío emocional o esa falta total de energía mental que experimentas con tu carrera. ¿Cómo se manifiesta en tu día a día?",
        "¿De qué manera sientes que este cansancio extremo y crónico está afectando tu bienestar de salud, tus hábitos de sueño y la calidad de tus relaciones con tus seres queridos?",
        "¿En qué momento específico del ciclo académico empezaste a notar que el agotamiento de tus estudios comenzó a invadir y arruinar tus fines de semana y tus momentos de descanso?",
        "Descríbeme qué cambios específicos has notado en tu vitalidad física cotidiana (dolores corporales, pesadez, falta de fuerza) desde que la carga de la universidad se volvió tan pesada.",
        "¿Cómo afecta este agotamiento acumulado a tu rendimiento intelectual y cognitivo? Por ejemplo, ¿te cuesta más trabajo retener información, recordar conceptos o concentrarte?",
        "Cuéntame qué pasa por tu mente cuando te das cuenta de que el cansancio académico es tan grande que ya no disfrutas de los pasatiempos o actividades que antes te apasionaban.",
        "¿De qué manera ha cambiado tu rutina de alimentación, hidratación o ejercicio debido a que utilizas toda tu poca energía disponible solo en cumplir con las clases?",
        "Describe detalladamente una situación reciente en la que hayas sentido que tocaste fondo a nivel de cansancio físico y mental por culpa de una entrega o examen."
    ],
    "cinismo_frecuencia": [
        "¿Con qué frecuencia te asalta el pensamiento de que tus estudios universitarios o la carrera que elegiste han perdido el verdadero sentido, interés y valor para tu vida?",
        "¿Qué tan seguido te descubres adoptando una postura distante, fría, apática o de total indiferencia frente a tus materias, tareas e interacciones en clase?",
        "¿Con qué frecuencia te cuestionas seriamente si realmente tomaste la decisión correcta al elegir esta carrera y si vale la pena el esfuerzo diario?",
        "¿Qué tan habitualmente sientes una profunda apatía, aburrimiento o desinterés absoluto por los temas teóricos y prácticos que te enseñan tus profesores diariamente?",
        "¿Con qué frecuencia te sorprendes queriendo terminar tus trabajos o tareas solo por cumplir con la nota, sin importarte en lo más mínimo si realmente estás aprendiendo algo útil?",
        "¿Qué tan seguido te sientes desconectado/a o desapegado/a de la vida comunitaria, eventos, debates o actividades que organiza tu facultad o universidad?",
        "¿Con qué frecuencia sientes que los contenidos de tus cursos son irrelevantes, obsoletos o no tienen ninguna aplicación real para tu futuro profesional?",
        "¿Qué tan habitualmente experimentas la sensación de que a la universidad o a tus profesores no les importa tu bienestar personal, sino únicamente tus calificaciones y estadísticas?",
        "¿Con qué frecuencia utilizas el sarcasmo, las quejas constantes o el desdén para referirte a tus obligaciones estudiantiles o al ambiente académico?",
        "¿Qué tan seguido sientes que tu entusiasmo original por tu área de estudio se ha transformado en un sentimiento de resignación, aburrimiento o frustración constante?"
    ],
    "cinismo_profunda": [
        "¿Cuáles consideras que son los factores o experiencias principales dentro de tu universidad que te han hecho perder el entusiasmo, la pasión o el interés inicial por tu carrera?",
        "¿Cómo logras lidiar con esa apatía o desinterés constante cuando sabes perfectamente que tienes la obligación de estudiar para un examen crucial para no reprobar?",
        "¿De qué manera esta falta de interés y desapego actual por tus estudios se proyecta en la forma en que te visualizas como profesional graduado/a en el futuro?",
        "Cuéntame detalladamente si has notado un cambio de actitud en tu forma de tratar a tus profesores o compañeros. ¿Sientes que eres más intolerante, desconfiado/a o distante?",
        "¿De qué forma crees que el sistema de evaluación o de enseñanza de tu universidad ha contribuido a que veas tus estudios con escepticismo o falta de sentido?",
        "Describe qué sientes cuando tus compañeros o familiares hablan con entusiasmo de sus carreras y tú, en contraste, sientes una profunda desconexión o desinterés por la tuya.",
        "¿Cómo manejas internamente el conflicto ético o personal de estar invirtiendo tiempo y dinero en una carrera en la que has dejado de creer o que ya no te inspira?",
        "Cuéntame de alguna clase o situación específica reciente en la que hayas sentido que estabas físicamente presente, pero con la mente completamente desconectada e indiferente a todo."
    ],
    "eficacia_frecuencia": [
        "¿Qué tan seguido te sientes verdaderamente seguro/a y convencido/a de tus propias habilidades para resolver con éxito cualquier problema o desafío académico que se te presente?",
        "¿Con qué frecuencia sientes que aportas ideas valiosas, creativas y eficaces al desarrollo de tus clases, debates o proyectos de trabajo grupal?",
        "¿Qué tan seguido experimentas una auténtica sensación de orgullo, satisfacción o alegría personal cuando logras alcanzar tus metas, notas y objetivos académicos?",
        "¿Con qué frecuencia crees firmemente en que eres un/a buen/a estudiante, con la capacidad intelectual necesaria para sacar adelante con éxito todo el ciclo académico?",
        "¿Qué tan seguido sientes que las técnicas de estudio que utilizas son eficientes y te permiten asimilar los conocimientos de manera profunda y rápida?",
        "¿Con qué frecuencia te sientes con la confianza suficiente para dar tu opinión en clase o debatir de manera constructiva con tus docentes sobre temas complejos?",
        "¿Qué tan habitualmente percibes que eres capaz de mantener la calma y el enfoque intelectual incluso cuando te enfrentas a una materia o examen sumamente difícil?",
        "¿Con qué frecuencia sientes que tu esfuerzo diario y dedicación constante se traducen de forma directa en un aprendizaje significativo y en excelentes resultados?",
        "¿Qué tan seguido te sientes motivado/a a asumir nuevos retos académicos (como proyectos de investigación, tutorías o concursos) porque confías en tu capacidad?",
        "¿Con qué frecuencia reconoces activamente tus talentos intelectuales y te das el crédito que mereces por tus logros, en lugar de minimizarlos?"
    ],
    "eficacia_profunda": [
        "Cuéntame de manera detallada alguna experiencia o logro académico reciente donde te hayas sentido sumamente competente, capaz y eficaz en tus clases.",
        "¿Qué aspectos específicos de tu rutina universitaria y tus hábitos de estudio te hacen sentir que tus esfuerzos, desvelos y sacrificios realmente valen la pena?",
        "¿De qué manera influyen los pequeños logros cotidianos (como comprender un tema difícil o recibir una felicitación) en tu confianza y motivación para seguir adelante?",
        "Describe en detalle qué habilidades o talentos específicos consideras que son tu mayor fuerte intelectual y cómo los utilizas para superar las dificultades del ciclo.",
        "¿De qué manera la confianza en tus capacidades te ayuda a sobreponerte rápidamente de una mala nota o de un comentario negativo de algún docente?",
        "Cuéntame cómo ha evolucionado tu percepción de autoeficacia académica desde que entraste a la universidad hasta el día de hoy. ¿Te sientes más o menos capaz?",
        "¿Qué papel juega el reconocimiento de tus compañeros o de tus docentes en la construcción de la seguridad que tienes al momento de realizar tus tareas?",
        "Describe cómo es tu diálogo interno en aquellos días en los que, a pesar de las dificultades, logras convencerte de que tienes todo lo necesario para triunfar académicamente."
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