// const URL_METRICAS_DASHBOARD = "http://localhost:8000/metricas-dashboard";
const URL_METRICAS_DASHBOARD = "https://chatbot-apoyo-emocional.onrender.com/metricas-dashboard";


const mapaFacultades = {
    'Ingeniería y Arquitectura': 'Ingenieria',
    'Ciencias de la Salud': 'Salud',
    'Humanidades': 'Humanidades',
    'Derecho y Ciencias Políticas': 'Derecho',
    'Ciencias Empresariales': 'Empresariales'
};

let ultimosDiagnosticos = [];

async function cargarMetricasDashboard() {
    try {
        const res = await fetch(URL_METRICAS_DASHBOARD);
        const data = await res.json();
        renderizarMetricasDashboard(data);
    } catch (err) {
        console.error("Error cargando métricas del dashboard:", err);
        const nota = document.getElementById('txtExplicacionRiesgo');
        if (nota) nota.innerHTML = `<b>Error:</b> no se pudo conectar con el Sheet. Verifica la URL o que el script esté implementado como "Cualquier usuario".`;
    }
}

function renderizarMetricasDashboard(data) {
    const diagnosticos = (data.diagnosticos || []).filter(d => d.Score_Ansiedad !== undefined);
    const satisfacciones = data.satisfacciones || [];
    ultimosDiagnosticos = diagnosticos;
    const n = diagnosticos.length;

    setTexto('kpiMuestraBadge', n);
    setTexto('kpiEstudiantes', n);

    if (n > 0) {
        const promAnsiedad = promedio(diagnosticos.map(d => Number(d.Score_Ansiedad) || 0));
        const promEstres = promedio(diagnosticos.map(d => Number(d.Score_Estres) || 0));
        const promBurnout = promedio(diagnosticos.map(d => Number(d.Score_Burnout) || 0));

        setTexto('kpiAnsiedad', Math.round(promAnsiedad) + '%');
        setTexto('kpiEstres', Math.round(promEstres) + '%');
        setTexto('kpiBurnout', Math.round(promBurnout) + '%');
    }

    if (satisfacciones.length > 0) {
        const promSat = promedio(satisfacciones.map(s => {
            const c = Number(s.ClaridadPreguntas) || 0;
            const co = Number(s.CoherenciaBot) || 0;
            return ((c + co) / 2) / 5 * 100;
        }));
        setTexto('kpiSatisfaccion', promSat.toFixed(1) + '%');
    }

    const selectCategoria = document.getElementById('selectCategoriaRiesgo');
    actualizarGraficoRiesgo(selectCategoria ? selectCategoria.value : 'ansiedad');

    actualizarParticipacionFacultad(diagnosticos);
}

function promedio(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function setTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
}

const camposPorCategoria = {
    ansiedad: 'Score_Ansiedad',
    estres: 'Score_Estres',
    burnout: 'Score_Burnout'
};

function actualizarGraficoRiesgo(categoria) {
    const campo = camposPorCategoria[categoria] || 'Score_Ansiedad';
    const n = ultimosDiagnosticos.length;

    if (!n) {
        setTexto('txtAlto', '0%');
        setTexto('txtModerado', '0%');
        setTexto('txtBajo', '0%');
        document.getElementById('barAlto').style.width = '0%';
        document.getElementById('barModerado').style.width = '0%';
        document.getElementById('barBajo').style.width = '0%';
        setTexto('txtExplicacionRiesgo', '');
        document.getElementById('txtExplicacionRiesgo').innerHTML = '<b>Nota:</b> aún no hay datos cargados. Realiza tamizajes o espera a que se sincronice el Sheet.';
        return;
    }

    let alto = 0, moderado = 0, bajo = 0;
    ultimosDiagnosticos.forEach(d => {
        const val = Number(d[campo]) || 0;
        if (val >= 60) alto++;
        else if (val >= 35) moderado++;
        else bajo++;
    });

    const pctAlto = Math.round((alto / n) * 100);
    const pctModerado = Math.round((moderado / n) * 100);
    const pctBajo = Math.round((bajo / n) * 100);

    setTexto('txtAlto', pctAlto + '%');
    setTexto('txtModerado', pctModerado + '%');
    setTexto('txtBajo', pctBajo + '%');
    document.getElementById('barAlto').style.width = pctAlto + '%';
    document.getElementById('barModerado').style.width = pctModerado + '%';
    document.getElementById('barBajo').style.width = pctBajo + '%';

    document.getElementById('txtExplicacionRiesgo').innerHTML =
        `<b>Distribución real:</b> calculada sobre ${n} estudiante(s) evaluado(s) hasta la fecha.`;
}

function actualizarParticipacionFacultad(diagnosticos) {
    const n = diagnosticos.length;
    const conteo = { Ingenieria: 0, Salud: 0, Humanidades: 0, Derecho: 0, Empresariales: 0 };

    diagnosticos.forEach(d => {
        const clave = mapaFacultades[d.Facultad];
        if (clave && conteo.hasOwnProperty(clave)) conteo[clave]++;
    });

    Object.keys(conteo).forEach(clave => {
        const pct = n ? Math.round((conteo[clave] / n) * 100) : 0;
        setTexto('txtFac' + clave, pct + '%');
        const barra = document.getElementById('barFac' + clave);
        if (barra) barra.style.width = pct + '%';
    });

    const notaTotal = document.getElementById('txtFacultadTotal');
    if (notaTotal) {
        notaTotal.textContent = n
            ? `Total: ${n} estudiante(s) registrado(s) en la muestra real.`
            : 'Aún no hay registros de la muestra.';
    }
}
