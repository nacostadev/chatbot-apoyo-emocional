const recursosPorDimensionYNivel = {
    estres: {
        Bajo: { 
            titulo: "Manejo del Estrés Leve", 
            video1: "https://www.youtube.com/embed/82ZJz8-lBbs", // Respiración guiada
            consejo: "Tus niveles de estrés son bajos. Sigue manteniendo tus buenos hábitos y realizando actividades relajantes." 
        },
        Moderado: { 
            titulo: "Estrategias para el Estrés Moderado", 
            video1: "https://www.youtube.com/embed/T6cb-x40jR0", // Mindfulness para el estrés
            consejo: "Se observan niveles de estrés que requieren atención. Toma pausas activas, organiza tu tiempo y practica respiración profunda." 
        },
        Alto: { 
            titulo: "Intervención en Estrés Alto", 
            video1: "https://www.youtube.com/embed/vKx2X8_0E_8", // Manejo de estrés agudo
            consejo: "Tus niveles de estrés son altos. Es fundamental buscar apoyo, delegar tareas y priorizar tu descanso físico y mental." 
        }
    },
    ansiedad: {
        Bajo: { 
            titulo: "Bienestar y Calma", 
            video1: "https://www.youtube.com/embed/zO3Ge2XoHgc", // Técnicas para relajarse
            consejo: "Tienes un buen manejo de la ansiedad. Continúa con tus estrategias actuales y mantén el equilibrio." 
        },
        Moderado: { 
            titulo: "Manejo de Ansiedad Moderada", 
            video1: "https://www.youtube.com/embed/p9jE2KzH3kE", // Ansiedad explicada
            consejo: "Podrías estar experimentando preocupación constante. Intenta técnicas de mindfulness y evita el exceso de cafeína." 
        },
        Alto: { 
            titulo: "Atención a la Ansiedad Alta", 
            video1: "https://www.youtube.com/embed/ZToicYcHIOU", // Qué hacer en crisis de ansiedad
            consejo: "La ansiedad está afectando tu bienestar. Te sugerimos fuertemente contactar al servicio de psicología para obtener herramientas especializadas." 
        }
    },
    agotamiento: {
        Bajo: { 
            titulo: "Energía y Vitalidad", 
            video1: "https://www.youtube.com/embed/e21Q2qR4oK4", // Importancia del descanso
            consejo: "Muestras niveles óptimos de energía. Asegúrate de seguir durmiendo tus 7-8 horas diarias." 
        },
        Moderado: { 
            titulo: "Previniendo el Agotamiento", 
            video1: "https://www.youtube.com/embed/Q4M8OqQc3B8", // Burnout estudiantil
            consejo: "Estás en riesgo de fatiga crónica. Intercala periodos de estudio con descanso real y desconexión digital." 
        },
        Alto: { 
            titulo: "Recuperación del Agotamiento Severo", 
            video1: "https://www.youtube.com/embed/t4bZ_oR_Y6c", // Recuperarse del Burnout
            consejo: "Presentas signos de burnout. Necesitas una pausa inmediata y considerar reajustar tu carga académica." 
        }
    },
    cinismo: {
        Bajo: { 
            titulo: "Compromiso Académico", 
            video1: "https://www.youtube.com/embed/WJq5r41y2nI", // Motivación
            consejo: "Mantienes una actitud positiva y comprometida con tus estudios." 
        },
        Moderado: { 
            titulo: "Reconectando con tu Propósito", 
            video1: "https://www.youtube.com/embed/d3W47xQ-99s", // Encontrar propósito
            consejo: "Si sientes apatía, busca reconectar con las razones por las que elegiste tu carrera e interactúa con compañeros." 
        },
        Alto: { 
            titulo: "Afrontando el Desapego Alto", 
            video1: "https://www.youtube.com/embed/vU-BmsaQjX8", // Superar apatía
            consejo: "El alto nivel de cinismo indica una desconexión profunda. Hablar con un consejero vocacional te será de gran ayuda." 
        }
    },
    eficacia: {
        Alto: { 
            titulo: "Eficacia Académica Alta", 
            video1: "https://www.youtube.com/embed/L1WbQ28-qEo", // Hábitos de éxito
            consejo: "¡Excelente! Confías en tus capacidades y logras tus objetivos académicos. Sigue así." 
        },
        Moderado: { 
            titulo: "Mejorando tu Eficacia", 
            video1: "https://www.youtube.com/embed/7VpDOPP3y0U", // Como organizar el tiempo
            consejo: "Establece metas más pequeñas y alcanzables para ir construyendo mayor confianza en tus habilidades." 
        },
        Bajo: { 
            titulo: "Potenciando tu Eficacia Baja", 
            video1: "https://www.youtube.com/embed/fWTaE04Bv6Q", // Superar el síndrome del impostor
            consejo: "Es posible que dudes de ti mismo. Revisa tus métodos de estudio con un tutor o acude a talleres académicos." 
        }
    }
};

/**
 * Clasifica el nivel (Alto, Moderado, Bajo) de una dimensión específica basado en su puntaje.
 * 
 * @param {string} dimension - La dimensión a evaluar ('estres', 'ansiedad', 'agotamiento', 'cinismo', 'eficacia')
 * @param {number} valor - El puntaje obtenido (0-100)
 * @returns {string} Nivel clasificado
 */
function clasificarNivel(dimension, valor) {
    if (dimension === 'eficacia') {
        if (valor > 70) return 'Alto';
        if (valor >= 40) return 'Moderado';
        return 'Bajo';
    } else {
        if (valor > 70) return 'Alto';
        if (valor > 35) return 'Moderado';
        return 'Bajo';
    }
}

/**
 * Retorna un objeto estructurado con título, video y consejo 
 * apropiados para la dimensión y puntaje dados.
 * 
 * @param {string} dimension - La dimensión ('estres', 'ansiedad', etc.)
 * @param {number} valor - El puntaje de dicha dimensión
 * @returns {Object} Objeto con { titulo, video1, consejo }
 */
function obtenerRecursoPsicoeducativo(dimension, valor) {
    const nivel = clasificarNivel(dimension, valor);
    const recursosDimension = recursosPorDimensionYNivel[dimension];
    
    if (recursosDimension && recursosDimension[nivel]) {
        return recursosDimension[nivel];
    }
    
    // Fallback por defecto si los datos no coinciden
    return {
        titulo: "Recursos de Apoyo Emocional",
        video1: "https://www.youtube.com/embed/tgbNymZ7vqY",
        consejo: "Recuerda que tu bienestar emocional es prioridad. Siempre es válido pedir ayuda."
    };
}
