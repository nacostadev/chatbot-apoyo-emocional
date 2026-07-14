// ============================
// SISTEMA DE PESTAÑAS (Chatbot / Métricas)
// ============================
function activarTab(tabId) {
    document.querySelectorAll('.app-tab').forEach(function (el) {
        el.classList.toggle('hidden', el.id !== tabId);
    });

    document.querySelectorAll('.sidebar .nav-item').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (tabId === 'tab-dashboard' && typeof cargarMetricasDashboard === 'function') {
        cargarMetricasDashboard();
    }
}

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
    puntajes: { estres: 0, ansiedad: 0, agotamiento: 0, cinismo: 0, eficacia: 0 },
    conclusionIA: '',
    nivelAlertaIA: '',
    rptaEstres: '',
    rptaAnsiedad: '',
    rptaAgotamiento: '',
    rptaCinismo: '',
    rptaEficacia: ''
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
                <div class="flex-row-layout" style="flex-wrap: wrap; gap: 10px; justify-content: center;">
                    <button onclick="seleccionarOpcionCierre('informarse')" class="btn-secondary">
                        <i data-lucide="book-open"></i> Informarme
                    </button>
                    <button onclick="seleccionarOpcionCierre('apoyo')" class="btn-secondary">
                        <i data-lucide="life-buoy"></i> Buscar Apoyo
                    </button>
                    <button onclick="finalizarTamizajeYApagarBot()" class="btn-primary">
                        <i data-lucide="log-out"></i> Salir
                    </button>
                </div>
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
    if (controls) controls.innerHTML = `<div style="text-align:center; color:#0d9488; font-size:0.8rem; font-weight:600;">⏳ Sincronizando flujo predictivo...</div>`;

    const URL_BASE = "http://localhost:8000"; 

    try {
        const res = await fetch(`${URL_BASE}/procesar-turno`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                indice_pregunta: estadoChat.indicePreguntaIA,
                valor_respuesta: valorEnviado,
                historial_categorias: estadoChat.categoriasRespondidas,
                historial_preguntas_text: estadoChat.preguntasTextoRespondidas
            })
        });

        const dataTurno = await res.json();

        if (dataTurno.finalizado) {
            estadoChat.pasoActual = 'reporte';
            await procesarDiagnosticoFinalNLP();
        } else {
            // CORRECCIÓN DE MAPEO CLAVE: Recibe correctamente lo enviado por Python
            estadoChat.preguntaActualBot = dataTurno.pregunta_siguiente;
            estadoChat.categoriaActualBot = dataTurno.categoria_siguiente;
            estadoChat.tipoPreguntaActualBot = dataTurno.tipo_siguiente;
            estadoChat.indicePreguntaIA = dataTurno.indice_siguiente;
            estadoChat.preguntasTextoRespondidas.push(dataTurno.pregunta_siguiente);

            await mostrarEfectoEscrituraBot(dataTurno.feedback);
            ejecutarFlujo();
        }
    } catch (error) {
        console.error("Error en el turno del bot:", error);
        alert("Error en el procesamiento del turno semántico con Localhost.");
    }
}

async function procesarDiagnosticoFinalNLP() {
    const loadingId = mostrarMensajeCargaBot();

    try {
        const res = await fetch("http://localhost:8000/diagnostico-final", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                respuestas_valores: estadoChat.respuestasValores,
                tipos_preguntas: estadoChat.tiposRespondidos,
                categorias_respondidas: estadoChat.categoriasRespondidas
            })
        });

        const diag = await res.json();
        eliminarMensajeCargaBot(loadingId);

        estadoChat.puntajes.estres = diag.estres;
        estadoChat.puntajes.ansiedad = diag.ansiedad;
        estadoChat.puntajes.agotamiento = diag.agotamiento;
        estadoChat.puntajes.cinismo = diag.cinismo;
        estadoChat.puntajes.eficacia = diag.eficacia;
        
        estadoChat.nivelAlertaIA = diag.nivel_alerta;
        estadoChat.conclusionIA = diag.conclusion;

        estadoChat.rptaEstres = diag.rpta_estres;
        estadoChat.rptaAnsiedad = diag.rpta_ansiedad;
        estadoChat.rptaAgotamiento = diag.rpta_agotamiento;
        estadoChat.rptaCinismo = diag.rpta_cinismo;
        estadoChat.rptaEficacia = diag.rpta_eficacia;

        generarReporteClinicoHtml();

        guardarDiagnosticoEnSheets();

        const controls = document.getElementById('chat-controls');
        if (controls) {
            controls.innerHTML = `
                <div style="text-align: center; color: #64748b; font-size: 0.85rem; padding: 12px; font-weight: 500;">
                    🔒 Tamizaje finalizado y almacenado con éxito.
                </div>
            `;
        }

    } catch (error) {
        console.error("Error al computar el diagnóstico de 5 dimensiones:", error);
        eliminarMensajeCargaBot(loadingId);
        alert("Ocurrió un error al procesar tu análisis. Por favor, reintenta.");
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
    const p = estadoChat.puntajes;
    const colorAlerta = estadoChat.nivelAlertaIA === 'Alto' ? '#ef4444' : (estadoChat.nivelAlertaIA === 'Moderado' ? '#f59e0b' : '#10b981');

    // Colores basados en el diseño de la imagen adjunta
    const getColorBarra = (val) => val > 70 ? '#ef4444' : (val > 35 ? '#f59e0b' : '#10b981');
    const getColorEficacia = (val) => val < 40 ? '#ef4444' : (val < 70 ? '#f59e0b' : '#10b981');

    let html = `
    <div class="reporte-final-anim" style="background:#ffffff; border: 1px solid #e2e8f0; border-radius:16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); padding:24px; width:100%; max-width:650px; margin: 15px auto; font-family: 'Plus Jakarta Sans', sans-serif;">
        
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 20px; display:flex; align-items:center; gap:14px;">
            <div style="background:#0f766e; color:white; width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i data-lucide="clipboard-check" style="width:22px; height:22px;"></i>
            </div>
            <div>
                <h2 style="color: #0f766e; margin: 0; font-size: 1.2rem; font-weight: 700; letter-spacing: -0.025em; text-transform: uppercase;">Reporte de Bienestar Académico</h2>
                <p style="color: #64748b; font-size: 0.78rem; margin: 2px 0 0 0; line-height: 1.2;">Evaluación Multidimensional (MBI-SS, GAD-7 y PSS-14)</p>
            </div>
        </div>

        <div style="background: #f8fafc; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; border: 1px solid #f1f5f9;">
            <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 35%;">Estudiante:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #1e293b; text-align: right;">${estadoChat.nombreEstudiante}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Edad / Sexo:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #1e293b; text-align: right;">${estadoChat.edadEstudiante} años / ${estadoChat.sexoEstudiante}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Facultad / Escuela:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #1e293b; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${estadoChat.facultadSeleccionada}</td>
                </tr>
            </table>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 5px solid ${colorAlerta}; padding: 16px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 700; color: #334155; font-size: 0.88rem; letter-spacing: -0.01em;">NIVEL DE RIESGO:</span>
                <span style="background: ${colorAlerta}; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                    ${estadoChat.nivelAlertaIA}
                </span>
            </div>
            <p style="color: #475569; font-size: 0.85rem; line-height: 1.55; margin: 0; text-align: justify;">
                <strong style="color: #1e293b;">Análisis Psicoeducativo:</strong> ${estadoChat.conclusionIA}
            </p>
        </div>

        <h3 style="color: #0f766e; font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.03em;">Indicadores Psicoemocionales</h3>
        
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Estrés Percibido (PSS)</span>
                    <span style="color: ${getColorBarra(p.estres)}; font-weight: 700;">${p.estres}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.estres)}; width: ${p.estres}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Ansiedad Generalizada (GAD)</span>
                    <span style="color: ${getColorBarra(p.ansiedad)}; font-weight: 700;">${p.ansiedad}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.ansiedad)}; width: ${p.ansiedad}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Agotamiento Emocional (MBI-SS D1)</span>
                    <span style="color: ${getColorBarra(p.agotamiento)}; font-weight: 700;">${p.agotamiento}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.agotamiento)}; width: ${p.agotamiento}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Cinismo / Desapego (MBI-SS D2)</span>
                    <span style="color: ${getColorBarra(p.cinismo)}; font-weight: 700;">${p.cinismo}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.cinismo)}; width: ${p.cinismo}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Eficacia Académica (MBI-SS D3)</span>
                    <span style="color: ${getColorEficacia(p.eficacia)}; font-weight: 700;">${p.eficacia}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorEficacia(p.eficacia)}; width: ${p.eficacia}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; display: flex; justify-content: center;">
            <button onclick="abrirModalSatisfaccion()" style="background: #0f766e; color: #ffffff; border: none; padding: 11px 22px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);">
                <i data-lucide="star" style="width:16px; height:16px;"></i>
                Evaluar Experiencia del Chatbot
            </button>
        </div>
    </div>`;

    const box = document.getElementById('chat-messages');
    if (box) {
        // En lugar de borrar la pantalla, agregamos el reporte de forma fluida como burbuja final del bot
        const reporteWrapper = document.createElement('div');
        reporteWrapper.className = "message-wrapper bot w-full clear-both dynamic-message-fade";
        reporteWrapper.innerHTML = html;
        box.appendChild(reporteWrapper);
        
        // Hacemos un scroll suave para enfocar el reporte clínico
        setTimeout(() => {
            box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
        }, 100);

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    return html;
}

function configurarRecursosPsicoeducativos() {
    const nivel = estadoChat.nivelAlertaIA;
    if (nivel === 'Alto') {
        recursosModalActual = {
            titulo: 'Gestión Activa del Estrés y Ansiedad',
            video1: '',
            consejo: 'Se detectaron niveles elevados de malestar emocional. Te recomendamos: practicar respiración diafragmática unos minutos al día, priorizar tus horas de sueño, aligerar tu carga inmediata si es posible y buscar apoyo profesional cuanto antes usando el botón "Buscar Apoyo".'
        };
    } else if (nivel === 'Moderado') {
        recursosModalActual = {
            titulo: 'Estrategias de Balance Académico',
            video1: '',
            consejo: 'Tus niveles de estrés y ansiedad son moderados. Organiza tu tiempo con técnicas como Pomodoro, toma pausas activas durante el estudio y comparte cómo te sientes con alguien de confianza.'
        };
    } else {
        recursosModalActual = {
            titulo: 'Mantén tu Bienestar Emocional',
            video1: '',
            consejo: 'Tus indicadores se encuentran en un rango saludable. Continúa con hábitos de autocuidado: sueño regular, actividad física y espacios de descanso entre tus responsabilidades académicas.'
        };
    }
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
    const tieneVideo = !!recursosModalActual.video1;

    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h4>${recursosModalActual.titulo || 'Recursos de Apoyo Psicoeducativo'}</h4>
                <button onclick="document.getElementById('modal-psicoeducativo').style.display='none'" class="modal-close-btn">&times;</button>
            </div>
            ${tieneVideo ? `
            <div class="modal-tabs-container">
                <button class="modal-tab-btn active" onclick="cambiarTabModal(this, 'tab-video1')">🎥 Video</button>
                <button class="modal-tab-btn" onclick="cambiarTabModal(this, 'tab-consejos')">💡 Consejos</button>
            </div>
            <div class="modal-tab-body">
                <div id="tab-video1" class="modal-tab-content active">
                    <div class="video-responsive-container"><iframe src="${recursosModalActual.video1}" frameborder="0" allowfullscreen></iframe></div>
                </div>
                <div id="tab-consejos" class="modal-tab-content">
                    <div class="consejos-box-content"><p>${recursosModalActual.consejo}</p></div>
                </div>
            </div>` : `
            <div class="modal-tab-body">
                <div class="consejos-box-content" style="padding: 4px 2px;">
                    <p style="line-height:1.6; color:#334155; font-size:0.9rem; text-align:justify;">${recursosModalActual.consejo || 'Aquí encontrarás recomendaciones personalizadas según tu evaluación.'}</p>
                </div>
            </div>`}
        </div>
    `;
    modal.style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
    // 1. Modificar textos de nivel porcentual en pantalla
    const pEstres = document.getElementById("pct-estres");
    const pAnsiedad = document.getElementById("pct-ansiedad");
    const pAgotamiento = document.getElementById("pct-agotamiento");
    const pCinismo = document.getElementById("pct-cinismo");
    const pEficacia = document.getElementById("pct-eficacia");

    if (pEstres) pEstres.innerText = Math.round(estadoChat.puntajes.estres) + "%";
    if (pAnsiedad) pAnsiedad.innerText = Math.round(estadoChat.puntajes.ansiedad) + "%";
    if (pAgotamiento) pAgotamiento.innerText = Math.round(estadoChat.puntajes.agotamiento) + "%";
    if (pCinismo) pCinismo.innerText = Math.round(estadoChat.puntajes.cinismo) + "%";
    if (pEficacia) pEficacia.innerText = Math.round(estadoChat.puntajes.eficacia) + "%";

    // 2. Ajustar el ancho visual de las barras de progreso
    const barEstres = document.getElementById("bar-estres");
    const barAnsiedad = document.getElementById("bar-ansiedad");
    const barAgotamiento = document.getElementById("bar-agotamiento");
    const barCinismo = document.getElementById("bar-cinismo");
    const barEficacia = document.getElementById("bar-eficacia");

    if (barEstres) barEstres.style.width = estadoChat.puntajes.estres + "%";
    if (barAnsiedad) barAnsiedad.style.width = estadoChat.puntajes.ansiedad + "%";
    if (barAgotamiento) barAgotamiento.style.width = estadoChat.puntajes.agotamiento + "%";
    if (barCinismo) barCinismo.style.width = estadoChat.puntajes.cinismo + "%";
    if (barEficacia) barEficacia.style.width = estadoChat.puntajes.eficacia + "%";

    // 3. Ajustar badge de alerta clínica global
    const badgeAlerta = document.getElementById("badge-alerta-global");
    if (badgeAlerta) {
        badgeAlerta.innerText = "Alerta: " + estadoChat.nivelAlertaIA;
        badgeAlerta.className = "px-3 py-1 rounded-full text-xs font-bold inline-block";
        if (estadoChat.nivelAlertaIA === "Alto") {
            badgeAlerta.classList.add("bg-red-100", "text-red-700");
        } else if (estadoChat.nivelAlertaIA === "Moderado") {
            badgeAlerta.classList.add("bg-amber-100", "text-amber-700");
        } else {
            badgeAlerta.classList.add("bg-green-100", "text-green-700");
        }
    }
}

function reiniciarChat() {
    document.getElementById('chat-messages').innerHTML = '';
    estadoChat = { pasoActual: 'terminos', nombreEstudiante: '', facultadSeleccionada: '', indicePreguntaIA: 0, preguntaActualBot: '', categoriaActualBot: '', tipoPreguntaActualBot: '', respuestasValores: [], tiposRespondidos: [], categoriasRespondidas: [], puntajes: { estres: 0, ansiedad: 0, agotamiento: 0, cinismo : 0, eficacia : 0 }, conclusionIA: '', nivelAlertaIA: '', textoConsolidadoCompleto: '' };
    ejecutarFlujo();
}

function validarYRegistrarDemografia() {
    const inputNombre = document.getElementById('inputNombre');
    const inputEdad = document.getElementById('inputEdad');
    const inputSexo = document.getElementById('inputSexo');

    const nombre = inputNombre ? inputNombre.value.trim() : '';
    const edad = inputEdad ? inputEdad.value.trim() : '';
    const sexo = inputSexo ? inputSexo.value : '';

    // Validaciones básicas requeridas por el estudio clínico
    if (!edad) {
        alert("Por favor, ingresa tu edad.");
        return;
    }
    if (parseInt(edad) < 15 || parseInt(edad) > 99) {
        alert("Por favor, ingresa una edad válida (entre 15 y 99 años).");
        return;
    }
    if (!sexo) {
        alert("Por favor, selecciona tu sexo.");
        return;
    }

    // Si el nombre se deja vacío, se asume Anónimo de forma automática
    estadoChat.nombreEstudiante = nombre ? nombre : 'Estudiante Anónimo';
    estadoChat.edadEstudiante = parseInt(edad);
    estadoChat.sexoEstudiante = sexo;

    agregarMesafeUsuarioFijo(`Mis datos - Nombre: ${estadoChat.nombreEstudiante}, Edad: ${estadoChat.edadEstudiante}, Sexo: ${estadoChat.sexoEstudiante}`);

    // Avanzar a la selección de facultad
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
    try {
        const payload = {
            Fecha: new Date().toISOString(),
            Estudiante: estadoChat.nombreEstudiante || "Anónimo",
            Edad: parseInt(estadoChat.edadEstudiante) || 18,
            Sexo: estadoChat.sexoEstudiante || "No especifica",
            Facultad: estadoChat.facultadSeleccionada || "General",
            Score_Estres: parseFloat(estadoChat.puntajes.estres) || 0.0,
            Score_Ansiedad: parseFloat(estadoChat.puntajes.ansiedad) || 0.0,
            Score_Agotamiento: parseFloat(estadoChat.puntajes.agotamiento) || 0.0,
            Score_Cinismo: parseFloat(estadoChat.puntajes.cinismo) || 0.0,
            Score_Eficacia: parseFloat(estadoChat.puntajes.eficacia) || 0.0,
            Alerta: estadoChat.nivelAlertaIA || "Bajo",
            Diagnostico: estadoChat.conclusionIA || "",
            Rpta_Estres: estadoChat.rptaEstres || '',
            Rpta_Ansiedad: estadoChat.rptaAnsiedad || '',
            Rpta_Agotamiento: estadoChat.rptaAgotamiento || '',
            Rpta_Cinismo: estadoChat.rptaCinismo || '',
            Rpta_Eficacia: estadoChat.rptaEficacia || ''
        };

        const res = await fetch("https://chatbot-apoyo-emocional.onrender.com/guardar-diagnostico", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const resJson = await res.json();
        if (resJson.status === "error") {
            console.error("❌ Error reportado al guardar en Google Sheets:", resJson.message);
        } else {
            console.log("✅ Resultados guardados exitosamente en Google Sheets.");
        }
    } catch (e) {
        console.error("❌ Error de red guardando diagnóstico:", e);
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

    const URL_GUARDAR_SATISFACCION = "http://localhost:8000/guardar-satisfaccion";
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
        const res = await fetch(URL_GUARDAR_SATISFACCION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosSatisfaccion)
        });
        const resultado = await res.json();
        if (resultado.status === "error") {
            console.error("❌ El backend reportó un error guardando la satisfacción:", resultado.message);
        }

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