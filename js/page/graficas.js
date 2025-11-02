/* --- pages/graficas.js --- */
import { store } from '../store.js'; // Importar store

// Variable global para Chart.js (accesible desde el CDN)
const Chart = window.Chart;

// Objeto para guardar las instancias de los gráficos
let instances = {};

// --- Función para formatear fechas ---
function formatLabelDate(dateString, timeString = null) {
    try {
        const date = new Date(dateString + 'T00:00:00'); // Asume zona horaria local
        const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        // Incluye la hora solo si es relevante (no '00:00')
        return timeString && timeString !== '00:00' ? `${formattedDate}, ${timeString}` : formattedDate;
    } catch (e) { return 'Fecha Inv.'; }
}

// --- Función genérica para setup ---
function checkDataAndSetup(chartId, instanceKey, data, minPoints = 2) {
    const ctx = document.getElementById(chartId)?.getContext('2d');
    // Busca el ID del <p> tag, ej: "artritis-no-data"
    const noDataMsg = document.getElementById(`${instanceKey}-no-data`); 

    if (!ctx || !noDataMsg) {
        console.error(`Elementos no encontrados para el gráfico: ${chartId} / ${instanceKey}-no-data`);
        return null; // No se puede continuar
    }

    // Destruir instancia anterior
    if (instances[instanceKey]) {
        instances[instanceKey].destroy();
        instances[instanceKey] = null;
    }

    // Validar datos
    if (!Array.isArray(data) || data.length < minPoints) {
        noDataMsg.classList.remove('hidden');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return null; // No hay suficientes datos
    } else {
        noDataMsg.classList.add('hidden');
        return ctx;
    }
}

// --- Definiciones de Gráficos ---

function renderGraficoCardiaco() {
    const instanceKey = 'cardiaco';
    const data = store.getCardiacoData() || [];
    const ctx = checkDataAndSetup('graficoCardiaco', instanceKey, data);
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
    const sistolicaData = sortedData.map(d => d.systolic);
    const diastolicaData = sortedData.map(d => d.diastolic);
    const pulsoData = sortedData.map(d => d.heartRate);

    instances[instanceKey] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [ { label: 'Sistólica (mmHg)', data: sistolicaData, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, yAxisID: 'yPresion' }, { label: 'Diastólica (mmHg)', data: diastolicaData, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, yAxisID: 'yPresion' }, { label: 'Pulso (BPM)', data: pulsoData, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, yAxisID: 'yPulso' } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { yPresion: { position: 'left', beginAtZero: false, title: { display: true, text: 'Presión (mmHg)' } }, yPulso: { position: 'right', beginAtZero: false, title: { display: true, text: 'Pulso (BPM)' }, grid: { drawOnChartArea: false } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
    });
}

function renderGraficoDiabetes() {
    const instanceKey = 'diabetes';
    const data = store.getDiabetesData() || [];
    const ctx = checkDataAndSetup('graficoDiabetes', instanceKey, data);
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
    const glucosaData = sortedData.map(d => d.glucose);
    const limiteAlto = 180, limiteBajo = 70;

    instances[instanceKey] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [{ label: 'Glucosa (mg/dL)', data: glucosaData, borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: ctx => { const v = ctx.raw; return v >= limiteAlto ? 'rgb(255, 99, 132)' : v < limiteBajo ? 'rgb(255, 205, 86)' : 'rgb(153, 102, 255)'; } }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, title: { display: true, text: 'Glucosa (mg/dL)' } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
    });
}

function renderGraficoPesoRenal() {
     const instanceKey = 'renal';
     const data = store.getBcmData() || [];
     const ctx = checkDataAndSetup('graficoPesoRenal', instanceKey, data);
     if (!ctx) return;

     const sortedData = [...data].sort((a, b) => a.id - b.id);
     const labels = sortedData.map(d => formatLabelDate(d.date));
     const pesoActualData = sortedData.map(d => parseFloat(d.currentWeight) || null);
     const pesoSecoData = sortedData.map(d => parseFloat(d.dryWeight) || null);
     const gananciaData = sortedData.map(d => { const a = parseFloat(d.currentWeight), s = parseFloat(d.dryWeight); return (!isNaN(a) && !isNaN(s)) ? (a - s).toFixed(1) : null; });

     instances[instanceKey] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [ { label: 'Peso Actual (kg)', data: pesoActualData, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, yAxisID: 'yPeso' }, { label: 'Peso Seco (kg)', data: pesoSecoData, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderDash: [5, 5], pointRadius: 0, tension: 0.1, yAxisID: 'yPeso' }, { label: 'Ganancia (kg)', data: gananciaData, borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)', type: 'bar', yAxisID: 'yGanancia' } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { yPeso: { position: 'left', beginAtZero: false, title: { display: true, text: 'Peso (kg)' } }, yGanancia: { position: 'right', beginAtZero: true, title: { display: true, text: 'Ganancia (kg)' }, grid: { drawOnChartArea: false } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
     });
}

function renderGraficoArtritisDolor() {
    // --- INICIO DE LA CORRECCIÓN ---
    const instanceKey = 'artritis'; // Corregido: Coincide con el ID 'artritis-no-data'
    // --- FIN DE LA CORRECCIÓN ---
     const data = store.getArtritisData() || [];
     const ctx = checkDataAndSetup('graficoArtritisDolor', instanceKey, data);
     if (!ctx) return;

     const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
     const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
     const dolorData = sortedData.map(d => d.painLevel);

     instances[instanceKey] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [{ label: 'Nivel de Dolor (0-10)', data: dolorData, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, fill: true, segment: { borderColor: ctx => { const y = ctx.p1.parsed.y; return y >= 8 ? 'rgb(198, 40, 40)' : y >= 4 ? 'rgb(230, 126, 34)' : 'rgb(46, 125, 50)'; }, backgroundColor: ctx => { const y = ctx.p1.parsed.y; return y >= 8 ? 'rgba(198, 40, 40, 0.2)' : y >= 4 ? 'rgba(230, 126, 34, 0.2)' : 'rgba(46, 125, 50, 0.2)'; } } }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10, title: { display: true, text: 'Nivel de Dolor' } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
    });
}

function renderGraficoTeaAnsiedad() {
    const instanceKey = 'tea-ansiedad';
    const data = store.getTeaData() || [];
    const ctx = checkDataAndSetup('graficoTeaAnsiedad', instanceKey, data);
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
    const ansiedadData = sortedData.map(d => d.anxietyLevel);

    instances[instanceKey] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [{ label: 'Nivel de Ansiedad (1-10)', data: ansiedadData, borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, min: 1, max: 10, title: { display: true, text: 'Nivel de Ansiedad' } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
    });
}

function renderGraficoTeaMood() {
    const instanceKey = 'tea-mood';
    const data = store.getTeaData() || [];
    const ctx = checkDataAndSetup('graficoTeaMood', instanceKey, data, 1);
    if (!ctx) return;

    const moodCounts = data.reduce((acc, curr) => { if(curr.mood) acc[curr.mood] = (acc[curr.mood] || 0) + 1; return acc; }, {});
    const labels = Object.keys(moodCounts);
    const counts = Object.values(moodCounts);

    if (labels.length === 0) { checkDataAndSetup(instanceKey, instanceKey, [], 1); return; }

    const backgroundColors = labels.map(mood => {
        if (mood === 'Feliz') return 'rgba(75, 192, 192, 0.6)'; if (mood === 'Tranquilo') return 'rgba(54, 162, 235, 0.6)'; if (mood === 'Ansioso') return 'rgba(255, 159, 64, 0.6)'; if (mood === 'Enojado') return 'rgba(255, 99, 132, 0.6)'; if (mood === 'Triste') return 'rgba(153, 102, 255, 0.6)'; return 'rgba(201, 203, 207, 0.6)';
    });

    instances[instanceKey] = new Chart(ctx, {
        type: 'bar', data: { labels, datasets: [{ label: 'Frecuencia', data: counts, backgroundColor: backgroundColors }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Número de Registros' } }, x: { title: { display: true, text: 'Estado de Ánimo' } } }, plugins: { legend: { display: false }, tooltip: { enabled: true } } }
    });
}

function renderGraficoRespiratorioPeakflow() {
    const instanceKey = 'respiratorio-peakflow';
    let data = store.getRespiratorioData() || [];
    data = data.filter(d => d.peakflow !== null && d.peakflow !== undefined && d.peakflow !== '');
    const ctx = checkDataAndSetup('graficoRespiratorioPeakflow', instanceKey, data);
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
    const peakflowData = sortedData.map(d => d.peakflow);

    instances[instanceKey] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [{ label: 'Flujo Máximo (L/min)', data: peakflowData, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, title: { display: true, text: 'Flujo Máximo (L/min)' } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
    });
}

function renderGraficoRespiratorioSeverity() {
     const instanceKey = 'respiratorio-severity';
     const data = store.getRespiratorioData() || [];
     const ctx = checkDataAndSetup('graficoRespiratorioSeverity', instanceKey, data);
     if (!ctx) return;

     const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
     const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
     const severityMap = { 'Leve': 1, 'Moderado': 2, 'Severo': 3 };
     const severityData = sortedData.map(d => severityMap[d.severity] || 0);

     instances[instanceKey] = new Chart(ctx, {
         type: 'line', data: { labels, datasets: [{ label: 'Severidad', data: severityData, borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.2)', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, stepped: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, min: 0, max: 3, ticks: { stepSize: 1, callback: function(value) { return ['','Leve', 'Moderado', 'Severo'][value] || ''; } }, title: { display: true, text: 'Severidad General' } }, x: { ticks: { maxRotation: 45, minRotation: 45 } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } const value = context.parsed.y; label += ['','Leve', 'Moderado', 'Severo'][value] || 'N/A'; return label; } } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } }
     });
}

// --- FUNCIONES ELIMINADAS ---
// renderGraficoGastricoSymptoms() ELIMINADA
// renderGraficoGeneralSymptoms() ELIMINADA


// --- Función Principal ---
export function init() {
    console.log("Cargado js/pages/graficas.js (v6 - Gráficos Gástrico/General eliminados)");

    // Verificar si Chart.js está cargado
    if (typeof Chart === 'undefined') {
        console.error("Chart.js no está cargado. Asegúrate de incluir el script en index.html.");
        const container = document.querySelector('.page-container .content-grid');
        if (container) container.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Error: No se pudo cargar la biblioteca de gráficos.</p>';
        return;
    }

    // Renderizar todos los gráficos implementados
    renderGraficoCardiaco();
    renderGraficoDiabetes();
    renderGraficoPesoRenal();
    renderGraficoArtritisDolor();
    renderGraficoTeaAnsiedad();
    renderGraficoTeaMood();
    renderGraficoRespiratorioPeakflow();
    renderGraficoRespiratorioSeverity();
    
    // LLAMADAS ELIMINADAS:
    // renderGraficoGastricoSymptoms();
    // renderGraficoGeneralSymptoms();
}