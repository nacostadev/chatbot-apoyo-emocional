const recursosPorDimensionYNivel = {
    estres: {
        Bajo: {
            titulo: "Técnicas para manejar el estrés",
            video1: "https://www.youtube.com/embed/RC5o36ErgCA",
            consejo: "Mantén una rutina de sueño de 7-8 horas y bloques de descanso entre sesiones de estudio."
        },
        Moderado: {
            titulo: "6 ejercicios respiratorios para estrés y ansiedad",
            video1: "https://www.youtube.com/embed/G-72baPOkoQ",
            consejo: "Practica respiración 4-7-8 antes de estudiar o rendir examen y usa la técnica Pomodoro (25 min estudio / 5 min descanso)."
        },
        Alto: {
            titulo: "10 señales de estrés crónico",
            video1: "https://www.youtube.com/embed/T675hI6AMv4",
            consejo: "Si notas fatiga persistente, insomnio o irritabilidad constante, es momento de acudir a Psicología UCV."
        }
    },
    ansiedad: {
        Bajo: {
            titulo: "Ejercicio de respiración para ansiedad y estrés (5 min)",
            video1: "https://www.youtube.com/embed/0mXT7lc-la0",
            consejo: "Identifica y anota tus pensamientos anticipatorios; escribirlos reduce su intensidad."
        },
        Moderado: {
            titulo: "Alivia la ansiedad con este ejercicio de respiración",
            video1: "https://www.youtube.com/embed/tA2kT8eSjtg",
            consejo: "Practica respiración diafragmática 3 veces al día y grounding 5-4-3-2-1 en momentos de pico."
        },
        Alto: {
            titulo: "Cómo superar la ansiedad: respiración diafragmática",
            video1: "https://www.youtube.com/embed/bO_oXpUf3rM",
            consejo: "Si la ansiedad interfiere con tu vida diaria (dormir, comer, socializar), busca apoyo profesional cuanto antes."
        }
    },
    agotamiento: {
        Bajo: {
            titulo: "Burnout académico: señales tempranas",
            video1: "https://www.youtube.com/embed/Z3vXqubKc8s",
            consejo: "Reserva tiempo semanal para actividades que disfrutes fuera del estudio; es prevención, no pérdida de tiempo."
        },
        Moderado: {
            titulo: "¡No te quemes! Burnout académico y laboral",
            video1: "https://www.youtube.com/embed/jYUQiuWHTNM",
            consejo: "Aprende a decir 'no' a tareas extra y aplica microdescansos cada 90 minutos de estudio."
        },
        Alto: {
            titulo: "Si te pasa esto... necesitas ayuda psicológica",
            video1: "https://www.youtube.com/embed/2Bs5nvAIfq4",
            consejo: "El agotamiento crónico puede derivar en abandono académico; busca acompañamiento profesional y evalúa reducir temporalmente tu carga de cursos."
        }
    },
    cinismo: {
        Bajo: {
            titulo: "Motivación para estudiantes: motivos para estudiar",
            video1: "https://www.youtube.com/embed/BTRFiiYGyV0",
            consejo: "Recuerda periódicamente el 'para qué' de tu carrera; reconectar con tu propósito previene el desapego."
        },
        Moderado: {
            titulo: "7 tips para recuperar la motivación",
            video1: "https://www.youtube.com/embed/GjnGriqVqOU",
            consejo: "Retoma contacto con compañeros de estudio; el aislamiento alimenta el cinismo, la conexión social lo revierte."
        },
        Alto: {
            titulo: "¿Vas a rendirte? La mejor motivación",
            video1: "https://www.youtube.com/embed/_zmDAFZV6fk",
            consejo: "El desapego sostenido suele ser una defensa ante el agotamiento acumulado; trabájalo con acompañamiento psicológico."
        }
    },
    eficacia: {
        Bajo: {
            titulo: "Querido estudiante: la mejor motivación",
            video1: "https://www.youtube.com/embed/rVAQBnSogso",
            consejo: "Divide tus metas grandes en objetivos pequeños y alcanzables; cada logro reconstruye tu confianza."
        },
        Moderado: {
            titulo: "Estrategias para mejorar el rendimiento académico",
            video1: "https://www.youtube.com/embed/QwQUmrUtxrM",
            consejo: "Usa técnicas de estudio activo (mapas mentales, explicar en voz alta lo aprendido) y súmate a un grupo de estudio."
        },
        Alto: {
            titulo: "La mejor motivación para estudiar y exámenes",
            video1: "https://www.youtube.com/embed/VIV_5rCmcL8",
            consejo: "Sigue así: comparte tus estrategias con compañeros, eso refuerza tu propia autoeficacia."
        }
    }
};

function clasificarNivel(dimension, valor) {
    if (dimension === 'eficacia') {
        if (valor < 40) return 'Bajo';
        if (valor < 70) return 'Moderado';
        return 'Alto';
    } else {
        if (valor <= 35) return 'Bajo';
        if (valor <= 70) return 'Moderado';
        return 'Alto';
    }
}


function setRecursoPsicoeducativo(dimension, valor) {
    const nivel = clasificarNivel(dimension, valor);
    const recurso = recursosPorDimensionYNivel[dimension][nivel];
    recursosModalActual = {
        titulo: recurso.titulo,
        video1: recurso.video1,
        consejo: recurso.consejo
    };
}
