let estadoChat = {
    pasoActual: 'terminos',
    nombreEstudiante: '',
    edadEstudiante: '',
    sexoEstudiante: '',
    facultadSeleccionada: '',
    indicePreguntaIA: 0,
    preguntaActualBot: '',
    categoriaActualBot: '',
    tipoPreguntaActualBot: '',
    respuestasValores: [],
    tiposRespondidos: [],
    categoriasRespondidas: [],
    preguntasTextoRespondidas: [],
    puntajes: { estres: 0, ansiedad: 0, burnout: 0 },
    conclusionIA: '',
    nivelAlertaIA: '',
    textoConsolidadoCompleto: ''
};

const opcionesFrecuencia = [
    { text: 'Nunca', value: 0 },
    { text: 'Varios días', value: 1 },
    { text: 'Más de la mitad de los días', value: 2 },
    { text: 'Casi todos los días', value: 3 }
];

window.onload = function () {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    ejecutarFlujo();
};

async function ejecutarFlujo() {
    const controls = document.getElementById('chat-controls');
    if (!controls) return;
    actualizarIndicadoresVisuales();

    switch (estadoChat.pasoActual) {
        case 'terminos':
            await mostrarEfectoEscrituraBot('¡Hola! Bienvenido/a al Sistema Inteligente de Evaluación Psicoemocional Universitario.');
            await mostrarEfectoEscrituraBot('Para iniciar, solicitamos tu consentimiento bajo el Código de Ética de la Universidad. El ingreso de tus datos personales es opcional y tus respuestas se utilizarán estrictamente para el entrenamiento del sistema'); controls.innerHTML = `
                <div class="flex-row-layout">
                    <button onclick="procesarTerminos(true)" class="btn-primary"><i data-lucide="check"></i> Acepto y deseo participar</button>
                    <button onclick="procesarTerminos(false)" class="btn-secondary"><i data-lucide="x"></i> Rechazar</button>
                </div>
            `;
            break;

        case 'identificacion':
            await mostrarEfectoEscrituraBot('Para iniciar tu tamizaje, por favor ingresa tus datos demográficos. Servirán únicamente para fines estadísticos de la investigación.');
            controls.innerHTML = `
        <div class="form-demografico">
            <input type="text" id="inputNombre" placeholder="Tu primer nombre (o dejer en blanco para Anónimo)..." class="input-text">
            <div class="form-row-mixto">
                <input type="number" id="inputEdad" placeholder="Edad" min="15" max="99" class="input-text">
                <select id="inputSexo" class="select-custom">
                    <option value="" disabled selected>Selecciona Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                </select>
            </div>
        </div>
        <button onclick="validarYRegistrarDemografia()" class="btn-primary" style="width: 100%;">
            <i data-lucide="save"></i> Guardar y Continuar
        </button>
    `;
            break;

        case 'facultad':
            const listaFacultades = ['Ciencias Empresariales', 'Ingeniería y Arquitectura', 'Humanidades', 'Ciencias de la Salud', 'Derecho y Ciencias Políticas'];
            await mostrarEfectoEscrituraBot(`Un gusto atenderte, ${estadoChat.nombreEstudiante}. Selecciona tu facultad de procedencia:`);
            let btnsFacultades = listaFacultades.map(fac => `
                <button onclick="procesarFacultad('${fac}')" class="btn-option"><span>${fac}</span><i data-lucide="chevron-right"></i></button>
            `).join('');
            controls.innerHTML = `<div class="grid-layout">${btnsFacultades}</div>`;
            break;

        case 'preguntas_ia':
            if (estadoChat.indicePreguntaIA === 0 && !estadoChat.preguntaActualBot) {
                controls.innerHTML = `<div style="text-align:center; color:#0d9488; font-size:0.8rem; font-weight:600;">⏳ Conectando...</div>`;
                try {
                    const response = await fetch("https://chatbot-apoyo-emocional.onrender.com/primera-pregunta"); const dataInit = await response.json();
                    estadoChat.preguntaActualBot = dataInit.pregunta;
                    estadoChat.categoriaActualBot = dataInit.categoria;
                    estadoChat.tipoPreguntaActualBot = dataInit.tipo;
                    estadoChat.indicePreguntaIA = dataInit.indice_siguiente;
                    estadoChat.preguntasTextoRespondidas = [dataInit.pregunta];
                } catch (err) {
                    console.error("Error trayendo reactivo inicial:", err);
                    alert("No se pudo conectar con las preguntas dinámicas de Python.");
                    return;
                }
            }

            await mostrarEfectoEscrituraBot(estadoChat.preguntaActualBot);

            if (estadoChat.tipoPreguntaActualBot === 'opciones') {
                let btnsOpciones = opcionesFrecuencia.map(opc => `
                    <button onclick="enviarTurnoOpcion(${opc.value}, '${opc.text}')" class="btn-option">
                        <span>${opc.text}</span>
                        <i data-lucide="circle-dot"></i>
                    </button>
                `).join('');
                controls.innerHTML = `<div class="grid-layout">${btnsOpciones}</div>`;
            } else {
                controls.innerHTML = `
                    <textarea id="txtRespuestaLibreIA" rows="3" placeholder="Redacta detalladamente tu experiencia abierta aquí..." class="textarea-custom"></textarea>
                    <button onclick="enviarTurnoTextoLibre()" class="btn-primary" style="width: 100%;">
                        <i data-lucide="corner-down-left"></i> Enviar Respuesta Abierta
                    </button>
                `;
            }
            break;

        case 'reporte':
            controls.innerHTML = `
                <button onclick="reiniciarChat()" class="btn-primary" style="max-width: 300px; margin: 0 auto;">
                    <i data-lucide="refresh-cw"></i> Realizar Nueva Simulación
                </button>
            `;
            generarReporteClinicoHtml();
            break;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function enviarTurnoOpcion(valorNumerico, textoMostrar) {
    agregarMesafeUsuarioFijo(textoMostrar);

    estadoChat.respuestasValores.push(String(valorNumerico));
    estadoChat.tiposRespondidos.push('opciones');
    estadoChat.categoriasRespondidas.push(estadoChat.categoriaActualBot);

    await avanzarTurnoAPI(String(valorNumerico));
}

async function enviarTurnoTextoLibre() {
    const area = document.getElementById('txtRespuestaLibreIA');
    const texto = area ? area.value.trim() : '';

    if (!texto || texto.length < 5) {
        alert("Por favor, introduce una respuesta más amplia para tu análisis.");
        return;
    }

    agregarMesafeUsuarioFijo(texto);

    estadoChat.respuestasValores.push(texto);
    estadoChat.tiposRespondidos.push('texto_libre');
    estadoChat.categoriasRespondidas.push(estadoChat.categoriaActualBot);

    await avanzarTurnoAPI(texto);
}

async function avanzarTurnoAPI(valorEnviado) {
    const controls = document.getElementById('chat-controls');
    controls.innerHTML = `<div style="text-align:center; color:#0d9488; font-size:0.8rem; font-weight:600;">⏳ Sincronizando flujo predictivo...</div>`;

    try {
        const res = await fetch("https://chatbot-apoyo-emocional.onrender.com/procesar-turno", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                indice_pregunta: estadoChat.indicePreguntaIA,
                valor_respuesta: valorEnviado,
                historial_categorias: estadoChat.categoriasRespondidas,
                historial_preguntas_text: estadoChat.preguntasTextoRespondidas // 🌟 SE ENVÍA EL HISTORIAL AL BACKEND
            })
        });

        const dataTurno = await res.json();

        if (dataTurno.finalizado) {
            estadoChat.pasoActual = 'finalizado';
            await procesarDiagnosticoFinalNLP();
        } else {
            estadoChat.preguntaActualBot = dataTurno.pregunta;
            estadoChat.categoriaActualBot = dataTurno.categoria;
            estadoChat.tipoPreguntaActualBot = dataTurno.tipo;
            estadoChat.indicePreguntaIA = dataTurno.indice_siguiente;
            estadoChat.preguntasTextoRespondidas.push(dataTurno.pregunta);

            await mostrarEfectoEscrituraBot(dataTurno.feedback_bot);
            ejecutarFlujo();
        }
    } catch (error) {
        console.error(error);
        alert("Error en el procesamiento del turno semántico.");
    }
}

async function procesarDiagnosticoFinalNLP() {
    const controls = document.getElementById('chat-controls');
    controls.innerHTML = `<div style="text-align:center; color:#0d9488; font-size:0.8rem; font-weight:600;">🧠 Sintetizando evaluación clínica multivariable...</div>`;

    try {
        const res = await fetch("https://chatbot-apoyo-emocional.onrender.com/diagnostico-final", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                respuestas_valores: estadoChat.respuestasValores,
                tipos_preguntas: estadoChat.tiposRespondidos,
                categorias_respondidas: estadoChat.categoriasRespondidas
            })
        });

        const dataDiag = await res.json();

        estadoChat.puntajes = {
            estres: dataDiag.estres,
            ansiedad: dataDiag.ansiedad,
            burnout: dataDiag.burnout
        };
        estadoChat.conclusionIA = dataDiag.conclusion;
        estadoChat.nivelAlertaIA = dataDiag.nivel_alerta;

        actualizarIndicadoresVisuales();

        await guardarResultadosEnBackend();

        generarReporteClinicoHtml();

    } catch (err) {
        console.error("Error en diagnóstico predictivo final:", err);
        controls.innerHTML = `<div style="text-align:center; color:#ef4444; font-size:0.8rem;">Error al procesar el cierre clínico.</div>`;
    }
}

function agregarMesafeUsuarioFijo(texto) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const wrapper = document.createElement('div');
    wrapper.className = "message-wrapper user";
    wrapper.innerHTML = `<div class="avatar-icon">YO</div><div class="message-bubble">${texto}</div>`;
    box.appendChild(wrapper);
    box.scrollTop = box.scrollHeight;
}

function procesarTerminos(acepta) {
    if (acepta) {
        agregarMesafeUsuarioFijo('He leído y acepto participar voluntariamente.');
        estadoChat.pasoActual = 'identificacion';
        ejecutarFlujo();
    } else {
        agregarMesafeUsuarioFijo('Prefiero rechazar los términos de participación.');
        document.getElementById('chat-controls').innerHTML = `<p style="font-size: 0.75rem; text-align: center; color: #ef4444; font-weight: 500; padding: 16px 0;">Es obligatorio aceptar los términos para el estudio clínico.</p>`;
    }
}

function registrarIdentidadManual() {
    const input = document.getElementById('inputNombre');
    const valor = input ? input.value.trim() : '';
    if (!valor) return;
    estadoChat.nombreEstudiante = valor;
    agregarMesafeUsuarioFijo(`Registrarme como: ${valor}`);
    estadoChat.pasoActual = 'facultad';
    ejecutarFlujo();
}

function registrarIdentidadAnonima() {
    estadoChat.nombreEstudiante = 'Estudiante Anónimo';
    agregarMesafeUsuarioFijo('Deseo proceder de manera completamente Anónima.');
    estadoChat.pasoActual = 'facultad';
    ejecutarFlujo();
}

function procesarFacultad(fac) {
    estadoChat.facultadSeleccionada = fac;
    agregarMesafeUsuarioFijo(`Pertenezco a la facultad de: ${fac}`);
    estadoChat.pasoActual = 'preguntas_ia';
    ejecutarFlujo();
}

function mostrarEfectoEscrituraBot(texto) {
    return new Promise((resolve) => {
        const box = document.getElementById('chat-messages');
        if (!box) return resolve();

        const indicador = document.createElement('div');
        indicador.className = "message-wrapper bot";
        indicador.innerHTML = `
            <div class="avatar-icon"><i data-lucide="bot" style="width:16px;height:16px;"></i></div>
            <div class="message-bubble typing-bubble"><span></span><span></span><span></span></div>
        `;
        box.appendChild(indicador);
        box.scrollTop = box.scrollHeight;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            indicador.remove();
            const wrapper = document.createElement('div');
            wrapper.className = "message-wrapper bot";
            wrapper.innerHTML = `
                <div class="avatar-icon"><i data-lucide="bot" style="width:16px;height:16px;"></i></div>
                <div class="message-bubble">${texto}</div>
            `;
            box.appendChild(wrapper);
            box.scrollTop = box.scrollHeight;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            resolve();
        }, 600);
    });
}

let recursosModalActual = { video1: '', video2: '', consejo: '' };

function generarReporteClinicoHtml() {
    const box = document.getElementById('chat-messages');
    if (!box) return;

    const e = estadoChat.puntajes.estres;
    const a = estadoChat.puntajes.ansiedad;
    const b = estadoChat.puntajes.burnout;

    let severidad = estadoChat.nivelAlertaIA || "Bajo";
    let claseRiesgo = "low";
    let labelRiesgo = "Estable / Buen estado";

    if (severidad === "Moderado") {
        claseRiesgo = "mod";
        labelRiesgo = "Estado Moderado";
    } else if (severidad === "Alto / Crítico" || severidad === "Crítico") {
        claseRiesgo = "crit";
        labelRiesgo = "Índice Alto / Crítico";
    }

    let categoriaMayor = 'estres';
    let maxPuntaje = e;
    if (a > maxPuntaje) { categoriaMayor = 'ansiedad'; maxPuntaje = a; }
    if (b > maxPuntaje) { categoriaMayor = 'burnout'; maxPuntaje = b; }

    if (categoriaMayor === 'ansiedad') {
        recursosModalActual = {
            titulo: "Recursos para Manejo de Ansiedad",
            video1: "https://www.youtube.com/embed/JQr6Ld8d-f8",
            consejo: "Practica la respiración diafragmática 4-7-8 antes de tus evaluaciones académicas."
        };
    } else if (categoriaMayor === 'burnout') {
        recursosModalActual = {
            titulo: "Recursos contra el Burnout Académico",
            video1: "https://www.youtube.com/embed/6WX3RH25o8M",
            consejo: "Establece barreras firmes entre tus fines de semana de ocio y las horas de estudio."
        };
    } else {
        recursosModalActual = {
            titulo: "Recursos para Estrés Académico",
            video1: "https://www.youtube.com/embed/ErwsvIqoRyI",
            consejo: "Implementa bloques Pomodoro controlados para evitar la saturación cognitiva de entregas."
        };
    }

    const htmlInforme = `
        <div class="report-card">
            <div class="report-title-section">
                <span class="report-meta-tag">Análisis Conversacional Mixto - UCV</span>
                <h4>Informe Psicoemocional vía Redes Neuronales NLP</h4>
            </div>
            
            <div class="report-grid-student">
                <div>Estudiante: <b>${estadoChat.nombreEstudiante}</b></div>
                <div>Facultad: <b>${estadoChat.facultadSeleccionada}</b></div>
            </div>

            <!-- 1. Indicador de Estado Principal -->
            <div class="insignia-risk ${claseRiesgo}" style="margin-bottom: 15px;">
                <span class="insignia-label">Indicador de Alerta Predictiva</span>
                <span class="insignia-value" style="font-size: 1.15rem; font-weight: 700; display: block; margin-top: 4px;">${labelRiesgo} (${severidad})</span>
            </div>

            <!-- 3. Gráficos Interactivos (Chart.js) -->
            <div style="position: relative; height: 200px; width: 100%; margin-bottom: 20px; background-color: #f8fafc; border-radius: 12px; padding: 10px; border: 1px solid #f1f5f9;">
                <canvas id="graficoResultadosIA"></canvas>
            </div>

            <!-- 2. Sección de Porcentajes -->
            <div class="metric-row">
                <div class="metric-header-info"><span>Densidad de Ansiedad</span><span>${a}%</span></div>
                <div class="progress-track-css"><div class="progress-fill-css ansiedad" style="width: ${a}%"></div></div>
            </div>
            <div class="metric-row">
                <div class="metric-header-info"><span>Densidad de Estrés</span><span>${e}%</span></div>
                <div class="progress-track-css"><div class="progress-fill-css estres" style="width: ${e}%"></div></div>
            </div>
            <div class="metric-row">
                <div class="metric-header-info"><span>Densidad de Burnout</span><span>${b}%</span></div>
                <div class="progress-track-css"><div class="progress-fill-css burnout" style="width: ${b}%"></div></div>
            </div>
            
            <div class="interpretation-box" style="margin-top: 16px;">
                <strong>Diagnóstico NLP Híbrido:</strong> ${estadoChat.conclusionIA}
            </div>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.className = "message-wrapper bot";
    wrapper.style.maxWidth = "100%";
    wrapper.innerHTML = `
        <div class="avatar-icon"><i data-lucide="award" style="width:16px;height:16px;color:#14b8a6;"></i></div>
        <div style="width: 100%; max-width: 550px;">${htmlInforme}</div>
    `;
    box.appendChild(wrapper);
    box.scrollTop = box.scrollHeight;

    // Renderizar gráfico con Chart.js inmediatamente
    setTimeout(() => {
        const ctx = document.getElementById('graficoResultadosIA');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Ansiedad', 'Estrés', 'Burnout'],
                    datasets: [{
                        label: 'Nivel (%)',
                        data: [a, e, b],
                        backgroundColor: [
                            a >= 60 ? 'rgba(239, 68, 68, 0.85)' : (a >= 35 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(16, 185, 129, 0.85)'),
                            e >= 60 ? 'rgba(239, 68, 68, 0.85)' : (e >= 35 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(16, 185, 129, 0.85)'),
                            b >= 60 ? 'rgba(239, 68, 68, 0.85)' : (b >= 35 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(16, 185, 129, 0.85)')
                        ],
                        borderColor: [
                            a >= 60 ? '#ef4444' : (a >= 35 ? '#f59e0b' : '#10b981'),
                            e >= 60 ? '#ef4444' : (e >= 35 ? '#f59e0b' : '#10b981'),
                            b >= 60 ? '#ef4444' : (b >= 35 ? '#f59e0b' : '#10b981')
                        ],
                        borderWidth: 1.5,
                        borderRadius: 8,
                        barPercentage: 0.55
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (context) { return ` ${context.parsed.y}%`; }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 25,
                                callback: function (value) { return value + '%'; },
                                font: { size: 10, weight: '500' }
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 11, weight: '600' } }
                        }
                    }
                }
            });
        }
    }, 100);

    setTimeout(async () => {
        await mostrarEfectoEscrituraBot(`El procesamiento ha concluido con éxito.`);
        const controls = document.getElementById('chat-controls');
        controls.innerHTML = `
            <div class="grid-layout" style="grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;">
                <button onclick="seleccionarOpcionCierre('informarse')" class="btn-secondary" style="justify-content: center; font-weight:600; display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="book-open" style="width:16px;height:16px;"></i> Informarse
                </button>
                <button onclick="seleccionarOpcionCierre('apoyo')" class="btn-secondary" style="justify-content: center; font-weight:600; display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="phone-call" style="width:16px;height:16px;"></i> Apoyo UCV
                </button>
                <button onclick="modalSatisfaccion()" class="btn-primary" style="justify-content: center; font-weight:600; display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="heart-handshake" style="width:16px;height:16px;"></i> Finalizar Chat
                </button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 600);
}

function seleccionarOpcionCierre(opcion) {
    if (opcion === 'informarse') { abrirModalPsicoeducativo(); }
    else if (opcion === 'apoyo') { inyectarCanalesApoyoWsp(); }
}

function abrirModalPsicoeducativo() {
    let modal = document.getElementById('modal-psicoeducativo');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-psicoeducativo';
        modal.className = 'custom-modal-overlay';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h4>${recursosModalActual.titulo}</h4>
                <button onclick="document.getElementById('modal-psicoeducativo').style.display='none'" class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-tabs-container">
                <button class="modal-tab-btn active" onclick="cambiarTabModal(this, 'tab-video1')">🎥 Video 1</button>
                <button class="modal-tab-btn" onclick="cambiarTabModal(this, 'tab-consejos')">💡 Consejos</button>
            </div>
            <div class="modal-tab-body">
                <div id="tab-video1" class="modal-tab-content active">
                    <div class="video-responsive-container"><iframe src="${recursosModalActual.video1}" frameborder="0" allowfullscreen></iframe></div>
                </div>
                <div id="tab-consejos" class="modal-tab-content">
                    <div class="consejos-box-content"><p>${recursosModalActual.consejo}</p></div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function cambiarTabModal(btn, tabId) {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function inyectarCanalesApoyoWsp() {
    const box = document.getElementById('chat-messages');
    const mensajeWhatsApp = encodeURIComponent(`Hola, soy ${estadoChat.nombreEstudiante}. Completé el tamizaje predictivo mixto en la UCV obteniendo alerta: ${estadoChat.nivelAlertaIA}. Solicito orientación.`);
    const urlWhatsApp = `https://wa.me/51974363148?text=${mensajeWhatsApp}`;

    const whatsappWrapper = document.createElement('div');
    whatsappWrapper.className = "message-wrapper bot";
    whatsappWrapper.innerHTML = `
        <div class="avatar-icon" style="background:#25d366;color:white;"><i data-lucide="phone" style="width:14px;height:14px;"></i></div>
        <div class="message-bubble" style="background-color:#f0fdf4;border:1px solid #bbf7d0;color:#166534;">
            <p style="margin-bottom:8px;">Canales preventivos activos. Coordina asistencia en el botón inferior:</p>
            <a href="${urlWhatsApp}" target="_blank" style="display:inline-flex;align-items:center;background-color:#25d366;color:white;padding:8px 12px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:0.75rem;">Contactar Psicología</a>
        </div>
    `;
    box.appendChild(whatsappWrapper);
    box.scrollTop = box.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function actualizarIndicadoresVisuales() {
    const pasos = ['consent', 'identificacion', 'facultad', 'eval'];
    pasos.forEach(p => { const d = document.getElementById(`step-${p}`); if (d) d.classList.remove('active'); });
    let activo = estadoChat.pasoActual === 'terminos' ? 'consent' : (estadoChat.pasoActual === 'identificacion' ? 'identificacion' : (estadoChat.pasoActual === 'facultad' ? 'facultad' : 'eval'));
    const a = document.getElementById(`step-${activo}`); if (a) a.classList.add('active');
}

function reiniciarChat() {
    document.getElementById('chat-messages').innerHTML = '';
    estadoChat = { pasoActual: 'terminos', nombreEstudiante: '', facultadSeleccionada: '', indicePreguntaIA: 0, preguntaActualBot: '', categoriaActualBot: '', tipoPreguntaActualBot: '', respuestasValores: [], tiposRespondidos: [], categoriasRespondidas: [], puntajes: { estres: 0, ansiedad: 0, burnout: 0 }, conclusionIA: '', nivelAlertaIA: '', textoConsolidadoCompleto: '' };
    ejecutarFlujo();
}

function validarYRegistrarDemografia() {
    const nom = document.getElementById('inputNombre').value.trim();
    const ed = document.getElementById('inputEdad').value.trim();
    const se = document.getElementById('inputSexo').value;

    if (!ed || !se) {
        alert("Por favor, completa los campos de Edad y Sexo para los gráficos estadísticos.");
        return;
    }

    estadoChat.nombreEstudiante = nom || 'Estudiante Anónimo';
    estadoChat.edadEstudiante = ed;
    estadoChat.sexoEstudiante = se;

    agregarMesafeUsuarioFijo(`Registrado: ${estadoChat.nombreEstudiante}, ${ed} años, Sexo: ${se}`);
    estadoChat.pasoActual = 'facultad';
    ejecutarFlujo();
}


let satisfaccionData = { claridad: 0, coherencia: 0 };

document.addEventListener("DOMContentLoaded", () => {
    configurarEstrellas("ratingClaridad", "claridad");
    configurarEstrellas("ratingCoherencia", "coherencia");
});

function configurarEstrellas(idContenedor, propiedad) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
    const estrellas = contenedor.querySelectorAll(".btn-star");
    estrellas.forEach(star => {
        star.addEventListener("click", () => {
            const val = parseInt(star.getAttribute("data-value"));
            satisfaccionData[propiedad] = val;
            estrellas.forEach(s => {
                const sVal = parseInt(s.getAttribute("data-value"));
                if (sVal <= val) s.classList.add("active");
                else s.classList.remove("active");
            });
        });
    });
}

async function guardarResultadosEnBackend() {
    const URL_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbzMARp2WPNss5d0fbR7ocwMHcGlQeSrbX8B1MCA5pdQ9wn4E8vSq5anTWashM-_TI0K/exec";

    const obtenerRespuestasPorCategoria = (categoriaBase) => {
        let opcionales = [];
        let libres = [];

        estadoChat.categoriasRespondidas.forEach((cat, index) => {
            if (cat.startsWith(categoriaBase)) {
                const rpta = estadoChat.respuestasValores[index] || "No registra";
                if (cat.endsWith("_frecuencia")) {
                    opcionales.push(rpta);
                } else if (cat.endsWith("_profunda")) {
                    libres.push(rpta);
                }
            }
        });

        return `Opc: ${opcionales.join(", ") || "N/A"} | Libre: ${libres.join(". ") || "N/A"}`;
    };

    const datosEnvio = {
        Fecha: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
        Estudiante: estadoChat.nombreEstudiante || "Estudiante Anónimo",
        Edad: Number(estadoChat.edadEstudiante) || 0,
        Sexo: estadoChat.sexoEstudiante || "No especifica",
        Facultad: estadoChat.facultadSeleccionada || "No especifica",

        Score_Ansiedad: estadoChat.puntajes.ansiedad,
        Score_Estres: estadoChat.puntajes.estres,
        Score_Burnout: estadoChat.puntajes.burnout,
        Score_Total: estadoChat.puntajes.ansiedad + estadoChat.puntajes.estres + estadoChat.puntajes.burnout,

        Alerta: estadoChat.nivelAlertaIA || "Bajo",
        Diagnostico: estadoChat.conclusionIA || "Sin novedades clínicas reportadas",

        Rpta_Ansiedad: obtenerRespuestasPorCategoria("ansiedad"),
        Rpta_Estres: obtenerRespuestasPorCategoria("estres"),
        Rpta_Burnout: obtenerRespuestasPorCategoria("burnout")
    };

    try {
        await fetch(URL_GOOGLE_SHEETS, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
            body: JSON.stringify(datosEnvio)
        });
        console.log("✅ Registro guardado con variables listas para Tabla Dinámica.");
    } catch (e) {
        console.error("❌ Error enviando datos a Google Sheets:", e);
    }
}

function modalSatisfaccion() {
    const modal = document.getElementById("modalSatisfaccion");
    if (modal) {
        modal.style.display = "flex";
    } else {
        console.error("No se encontró el contenedor modalSatisfaccion en el DOM.");
    }
}

async function finalizarTamizajeYApagarBot() {
    await mostrarEfectoEscrituraBot("🛑 [SISTEMA]: Sesión de tamizaje clínico finalizada con éxito. Cerrando canal seguro y desconectando el agente de inferencia emocional... ¡Gracias por tu valiosa participación!");

    const controls = document.getElementById('chat-controls');
    if (controls) controls.innerHTML = `<div style="text-align:center; color:#64748b; font-size:0.8rem; font-weight:600; padding:10px;">🔒 Conexión finalizada de forma segura.</div>`;

    setTimeout(() => {
        document.getElementById("modalSatisfaccion").style.display = "flex";
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 1500);
}

async function enviarSatisfaccionSheets() {
    if (satisfaccionData.claridad === 0 || satisfaccionData.coherencia === 0) {
        alert("Por favor, selecciona una puntuación de estrellas para ambas preguntas antes de finalizar.");
        return;
    }

    const URL_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbzMARp2WPNss5d0fbR7ocwMHcGlQeSrbX8B1MCA5pdQ9wn4E8vSq5anTWashM-_TI0K/exec";
    const comentario = document.getElementById("txtComentarioSatisfaccion").value.trim();

    const datosSatisfaccion = {
        FlujoTipo: "SATISFACCION_USUARIO",
        Fecha: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
        Estudiante: estadoChat.nombreEstudiante || "Anónimo",
        Facultad: estadoChat.facultadSeleccionada || "No registra",
        ClaridadPreguntas: satisfaccionData.claridad,
        CoherenciaBot: satisfaccionData.coherencia,
        SugerenciaComentario: comentario || "Sin comentarios adicionales"
    };

    try {
        await fetch(URL_GOOGLE_SHEETS, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(datosSatisfaccion)
        });

        document.getElementById("modalSatisfaccion").style.display = "none";
        mostrarToastFeedback();
    } catch (e) {
        console.error(e);
        alert("Error de red al guardar la satisfacción.");
    }
}

function mostrarToastFeedback() {
    let toast = document.getElementById('toast-satisfaccion');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-satisfaccion';
        toast.className = 'toast-container-custom';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                <i data-lucide="check-circle" style="width: 20px; height: 20px; color: #10b981;"></i>
            </div>
            <div class="toast-message">
                ¡Gracias por tu respuesta! Los datos se han enviado correctamente.
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('fade-out');
    }, 2700);

    setTimeout(() => {
        window.location.reload();
    }, 3000);
}