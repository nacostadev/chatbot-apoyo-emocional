
const API_BASE_URL = "https://chatbot-apoyo-emocional.onrender.com";

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

    if (tabId === 'tab-dashboard') {
        cargarMetricasDashboard();
    }
}

// ============================
// ESTADO Y FLUJO DEL CHATBOT
// ============================
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
            procesarDiagnosticoFinalNLP();
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

    const URL_BASE = "https://chatbot-apoyo-emocional.onrender.com"; 

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

        if (!res.ok) {
            throw new Error(`Error en el servidor: Status ${res.status}`);
        }

        const dataTurno = await res.json();

        if (!dataTurno) {
            throw new Error("El servidor devolvió una respuesta vacía.");
        }

        if (dataTurno.finalizado) {
            estadoChat.pasoActual = 'reporte';
            await procesarDiagnosticoFinalNLP();
        } else {
            // CORRECCIÓN DE MAPEO CLAVE: Recibe correctamente lo enviado por Python
            estadoChat.preguntaActualBot = dataTurno.pregunta;
            estadoChat.categoriaActualBot = dataTurno.categoria;
            estadoChat.tipoPreguntaActualBot = dataTurno.tipo;
            estadoChat.indicePreguntaIA = dataTurno.indice_siguiente;
            estadoChat.preguntasTextoRespondidas.push(dataTurno.pregunta);

            await mostrarEfectoEscrituraBot(dataTurno.feedback_bot);
            ejecutarFlujo();
        }
    } catch (error) {
        console.error("Error en el turno del bot:", error);
        alert("Error en el procesamiento del turno semántico con Localhost.");
    }
}

async function procesarDiagnosticoFinalNLP() {
    const controls = document.getElementById('chat-controls');
    controls.innerHTML = `<div style="text-align:center; color:#0d9488; font-size:0.8rem; font-weight:600;">🧠 Sintetizando evaluación clínica multivariable...</div>`;

    try {
        // Convertimos todos los valores de respuesta a String para cumplir estrictamente con el backend de FastAPI
        const respuestasString = estadoChat.respuestasValores.map(val => String(val));

        const res = await fetch(`${API_BASE_URL}/diagnostico-final`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                respuestas_valores: respuestasString,
                tipos_preguntas: estadoChat.tiposRespondidos,
                categorias_respondidas: estadoChat.categoriasRespondidas
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Error en el cálculo (Status ${res.status}): ${errText}`);
        }

        const dataDiag = await res.json();

        estadoChat.puntajes.estres = dataDiag.estres;
        estadoChat.puntajes.ansiedad = dataDiag.ansiedad;
        estadoChat.puntajes.agotamiento = dataDiag.agotamiento;
        estadoChat.puntajes.cinismo = dataDiag.cinismo;
        estadoChat.puntajes.eficacia = dataDiag.eficacia;
        
        estadoChat.nivelAlertaIA = dataDiag.nivel_alerta;
        estadoChat.conclusionIA = dataDiag.conclusion;

        estadoChat.rptaEstres = dataDiag.rpta_estres;
        estadoChat.rptaAnsiedad = dataDiag.rpta_ansiedad;
        estadoChat.rptaAgotamiento = dataDiag.rpta_agotamiento;
        estadoChat.rptaCinismo = dataDiag.rpta_cinismo;
        estadoChat.rptaEficacia = dataDiag.rpta_eficacia;

        generarReporteClinicoHtml();

        guardarResultadosEnBackend();

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

function mostrarMensajeCargaBot() {
    const box = document.getElementById('chat-messages');
    if (!box) return null;

    const id = 'loading-' + Date.now();
    const indicador = document.createElement('div');
    indicador.id = id;
    indicador.className = "message-wrapper bot";
    indicador.innerHTML = `
        <div class="avatar-icon"><i data-lucide="bot" style="width:16px;height:16px;"></i></div>
        <div class="message-bubble typing-bubble"><span></span><span></span><span></span></div>
    `;
    box.appendChild(indicador);
    box.scrollTop = box.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return id;
}

function eliminarMensajeCargaBot(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
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

let recursosModalActual = { titulo: '', video1: '', consejo: '' };

function generarReporteClinicoHtml() {
    const p = estadoChat.puntajes;
    const colorAlerta = estadoChat.nivelAlertaIA === 'Alto' ? '#ef4444' : (estadoChat.nivelAlertaIA === 'Moderado' ? '#f59e0b' : '#10b981');

    // Colores basados en el diseño de la imagen adjunta
    const getColorBarra = (val) => val > 70 ? '#ef4444' : (val > 35 ? '#f59e0b' : '#10b981');
    const getColorEficacia = (val) => val < 40 ? '#ef4444' : (val < 70 ? '#f59e0b' : '#10b981');
    // <div style="margin-bottom: 20px;">
    //     <p style="color: #94a3b8; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.05em;">ANÁLISIS CONVERSACIONAL MIXTO – UCV</p>
    //     <h2 style="color: #1e293b; margin: 0; font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em;">Informe Psicoemocional vía Redes Neuronales NLP</h2>
    // </div>

    let html = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif;">

        <div style="background: #f8fafc; border-radius: 12px; padding: 12px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; border: 1px solid #f1f5f9;">
            <div style="font-size: 0.8rem;"><span style="color: #64748b;">Estudiante:</span> <strong style="color: #334155;">${estadoChat.nombreEstudiante}</strong></div>
            <div style="font-size: 0.8rem;"><span style="color: #64748b;">Facultad:</span> <strong style="color: #334155;">${estadoChat.facultadSeleccionada}</strong></div>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
            <p style="color: #92400e; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.05em;">INDICADOR DE ALERTA PREDICTIVA</p>
            <h3 style="color: #b45309; margin: 0; font-size: 1.25rem; font-weight: 800;">Estado ${estadoChat.nivelAlertaIA} (${estadoChat.nivelAlertaIA})</h3>
        </div>

        <h3 style="color: #0f766e; font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.03em;">Indicadores Psicoemocionales</h3>
        
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Estrés Percibido</span>
                    <span style="color: ${getColorBarra(p.estres)}; font-weight: 700;">${p.estres}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.estres)}; width: ${p.estres}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Ansiedad Generalizada</span>
                    <span style="color: ${getColorBarra(p.ansiedad)}; font-weight: 700;">${p.ansiedad}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.ansiedad)}; width: ${p.ansiedad}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Agotamiento Emocional</span>
                    <span style="color: ${getColorBarra(p.agotamiento)}; font-weight: 700;">${p.agotamiento}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.agotamiento)}; width: ${p.agotamiento}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Cinismo / Desapego</span>
                    <span style="color: ${getColorBarra(p.cinismo)}; font-weight: 700;">${p.cinismo}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorBarra(p.cinismo)}; width: ${p.cinismo}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: #475569; font-weight: 600;">Eficacia Académica</span>
                    <span style="color: ${getColorEficacia(p.eficacia)}; font-weight: 700;">${p.eficacia}%</span>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: ${getColorEficacia(p.eficacia)}; width: ${p.eficacia}%; height: 100%; border-radius: 9999px; transition: width 0.6s ease;"></div>
                </div>
            </div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 12px;">
            <p style="color: #065f46; font-size: 0.85rem; line-height: 1.55; margin: 0; text-align: justify;">
                <strong>Diagnóstico NLP Híbrido:</strong> ${estadoChat.conclusionIA}
            </p>
        </div>
    </div>`;

    const box = document.getElementById('chat-messages');
    if (box) {
        const reporteWrapper = document.createElement('div');
        reporteWrapper.className = "message-wrapper bot";
        reporteWrapper.innerHTML = `
            <div class="avatar-icon"><i data-lucide="bot" style="width:16px;height:16px;"></i></div>
            <div class="message-bubble" style="width: 100%; max-width: 550px; padding: 20px;">
                ${html}
            </div>
        `;
        box.appendChild(reporteWrapper);
        
        setTimeout(() => {
            box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
        }, 100);
    }

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
    if (opcion === 'informarse') { 
        // 1. Obtener la dimensión de mayor riesgo basándonos en los puntajes
        const p = estadoChat.puntajes;
        const riesgos = [
            { dimension: 'estres', valor: p.estres, riesgo: p.estres },
            { dimension: 'ansiedad', valor: p.ansiedad, riesgo: p.ansiedad },
            { dimension: 'agotamiento', valor: p.agotamiento, riesgo: p.agotamiento },
            { dimension: 'cinismo', valor: p.cinismo, riesgo: p.cinismo },
            // Para eficacia, un valor bajo indica mayor riesgo
            { dimension: 'eficacia', valor: p.eficacia, riesgo: 100 - p.eficacia }
        ];
        
        // Ordenamos de mayor a menor riesgo
        riesgos.sort((a, b) => b.riesgo - a.riesgo);
        const dimensionPrincipal = riesgos[0];

        // 2. Invocar la nueva función de recursos.js (debe estar cargado antes en el HTML)
        if (typeof setRecursoPsicoeducativo === 'function') {
            setRecursoPsicoeducativo(dimensionPrincipal.dimension, dimensionPrincipal.valor);
        } else {
            console.error("El módulo recursos.js no está cargado correctamente.");
        }

        abrirModalPsicoeducativo(); 
    }
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
    estadoChat = { pasoActual: 'terminos', nombreEstudiante: '', facultadSeleccionada: '', indicePreguntaIA: 0, preguntaActualBot: '', categoriaActualBot: '', tipoPreguntaActualBot: '', respuestasValores: [], tiposRespondidos: [], categoriasRespondidas: [], puntajes: { estres: 0, ansiedad: 0, agotamiento: 0, cinismo: 0, eficacia: 0 }, conclusionIA: '', nivelAlertaIA: '', textoConsolidadoCompleto: '' };
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
    try {
        const payload = {
            action: "guardar_diagnostico",
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
        const resultado = await res.json();
        if (resultado.status === "error") {
            console.error("❌ El backend reportó un error guardando en Sheets:", resultado.message);
        } else {
            console.log("✅ Registro guardado correctamente vía backend.");
        }
    } catch (e) {
        console.error("❌ Error enviando datos al backend:", e);
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

let envioSatisfaccionEnCurso = false;

async function enviarSatisfaccionSheets() {
    if (envioSatisfaccionEnCurso) return;

    if (satisfaccionData.claridad === 0 || satisfaccionData.coherencia === 0) {
        alert("Por favor, selecciona una puntuación de estrellas para ambas preguntas antes de finalizar.");
        return;
    }

    const btnEnviar = document.querySelector('.btn-modal-submit');
    envioSatisfaccionEnCurso = true;
    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
    }

    const URL_GUARDAR_SATISFACCION = `${API_BASE_URL}/guardar-satisfaccion`;
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
        envioSatisfaccionEnCurso = false;
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar Evaluación y Finalizar';
        }
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
