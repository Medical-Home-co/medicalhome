/* --- pages/graficas.js --- */
import { store } from '../store.js'; // Importar store

// Variable global para Chart.js (accesible desde el CDN)
const Chart = window.Chart;

// Variables para guardar las instancias de los gráficos (para actualizarlos o destruirlos)
let graficoCardiacoInstance = null;
let graficoDiabetesInstance = null;
let graficoPesoRenalInstance = null;
let graficoArtritisDolorInstance = null;

// --- Función para formatear fechas para las etiquetas del gráfico ---
function formatLabelDate(dateString, timeString = null) {
    try {
        const date = new Date(dateString + 'T00:00:00'); // Asegurar UTC offset local
        const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        // Devolver con hora solo si la hora es válida (no '00:00' por defecto de algunos datos)
        return timeString && timeString !== '00:00' ? `${formattedDate} ${timeString}` : formattedDate;
    } catch (e) {
        return 'Fecha Inválida';
    }
}


// --- Gráfico Cardíaco ---
function renderGraficoCardiaco() {
    const ctx = document.getElementById('graficoCardiaco')?.getContext('2d');
    const noDataMsg = document.getElementById('cardiaco-no-data');
    if (!ctx || !noDataMsg) {
        // console.error("Canvas o mensaje 'no data' para gráfico Cardíaco no encontrado.");
        return;
    }

    const data = store.getCardiacoData() || []; // Obtener datos

    // Necesitamos al menos 2 puntos para una línea útil
    if (data.length < 2) {
        noDataMsg.classList.remove('hidden');
        if (graficoCardiacoInstance) { graficoCardiacoInstance.destroy(); graficoCardiacoInstance = null; }
        return;
    } else {
         noDataMsg.classList.add('hidden');
    }

    // Ordenar datos por fecha/hora ascendente para el gráfico
    const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

    const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
    const sistolicaData = sortedData.map(d => d.systolic);
    const diastolicaData = sortedData.map(d => d.diastolic);
    const pulsoData = sortedData.map(d => d.heartRate);

    if (graficoCardiacoInstance) { graficoCardiacoInstance.destroy(); }

    graficoCardiacoInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sistólica (mmHg)',
                    data: sistolicaData,
                    borderColor: 'rgb(255, 99, 132)', // Rojo
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1, pointRadius: 4, pointHoverRadius: 6,
                    yAxisID: 'yPresion'
                },
                {
                    label: 'Diastólica (mmHg)',
                    data: diastolicaData,
                    borderColor: 'rgb(54, 162, 235)', // Azul
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1, pointRadius: 4, pointHoverRadius: 6,
                    yAxisID: 'yPresion'
                },
                {
                    label: 'Pulso (BPM)',
                    data: pulsoData,
                    borderColor: 'rgb(75, 192, 192)', // Verde/Turquesa
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1, pointRadius: 4, pointHoverRadius: 6,
                    yAxisID: 'yPulso' // Usar eje secundario
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yPresion: { // Eje Y principal (Presión)
                    position: 'left',
                    beginAtZero: false,
                    title: { display: true, text: 'Presión (mmHg)' }
                },
                yPulso: { // Eje Y secundario para Pulso
                    position: 'right',
                    beginAtZero: false,
                    title: { display: true, text: 'Pulso (BPM)' },
                    grid: { drawOnChartArea: false } // No dibujar rejilla
                },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            },
            plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

// --- Gráfico Diabetes (Glucosa) ---
function renderGraficoDiabetes() {
    const ctx = document.getElementById('graficoDiabetes')?.getContext('2d');
    const noDataMsg = document.getElementById('diabetes-no-data');
    if (!ctx || !noDataMsg) {
        // console.error("Canvas o mensaje 'no data' para gráfico Diabetes no encontrado.");
        return;
    }

    const data = store.getDiabetesData() || [];

    if (data.length < 2) {
        noDataMsg.classList.remove('hidden');
        if (graficoDiabetesInstance) { graficoDiabetesInstance.destroy(); graficoDiabetesInstance = null; }
        return;
    } else {
        noDataMsg.classList.add('hidden');
    }

    const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

    const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
    const glucosaData = sortedData.map(d => d.glucose);
    const limiteAlto = 180;
    const limiteBajo = 70;

    if (graficoDiabetesInstance) { graficoDiabetesInstance.destroy(); }

    graficoDiabetesInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Glucosa (mg/dL)',
                data: glucosaData,
                borderColor: 'rgb(153, 102, 255)', // Morado
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: ctx => {
                     const value = ctx.raw;
                     if (value >= limiteAlto) return 'rgb(255, 99, 132)'; // Rojo si alta
                     if (value < limiteBajo) return 'rgb(255, 205, 86)'; // Amarillo si baja
                     return 'rgb(153, 102, 255)'; // Morado normal
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Glucosa (mg/dL)' } },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

// --- Gráfico Renal (Peso y Ganancia) ---
function renderGraficoPesoRenal() {
     const ctx = document.getElementById('graficoPesoRenal')?.getContext('2d');
     const noDataMsg = document.getElementById('renal-no-data');
     if (!ctx || !noDataMsg) {
         // console.error("Canvas o mensaje 'no data' para gráfico Renal no encontrado.");
         return;
     }

     const data = store.getBcmData() || [];

     if (data.length < 2) {
         noDataMsg.classList.remove('hidden');
         if (graficoPesoRenalInstance) { graficoPesoRenalInstance.destroy(); graficoPesoRenalInstance = null; }
         return;
     } else {
         noDataMsg.classList.add('hidden');
     }

     // Ordenar por ID (timestamp) ascendente para el gráfico
     const sortedData = [...data].sort((a, b) => a.id - b.id);

     const labels = sortedData.map(d => formatLabelDate(d.date)); // Solo fecha
     const pesoActualData = sortedData.map(d => parseFloat(d.currentWeight) || null);
     const pesoSecoData = sortedData.map(d => parseFloat(d.dryWeight) || null);
     const gananciaData = sortedData.map(d => {
         const actual = parseFloat(d.currentWeight);
         const seco = parseFloat(d.dryWeight);
         return (!isNaN(actual) && !isNaN(seco)) ? (actual - seco).toFixed(1) : null;
     });

     if (graficoPesoRenalInstance) { graficoPesoRenalInstance.destroy(); }

     graficoPesoRenalInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Peso Actual (kg)',
                    data: pesoActualData,
                    borderColor: 'rgb(54, 162, 235)', // Azul
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1, pointRadius: 4, pointHoverRadius: 6,
                    yAxisID: 'yPeso'
                },
                {
                    label: 'Peso Seco (kg)',
                    data: pesoSecoData,
                    borderColor: 'rgb(75, 192, 192)', // Verde/Turquesa
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.1,
                    yAxisID: 'yPeso'
                },
                 {
                    label: 'Ganancia (kg)',
                    data: gananciaData,
                    borderColor: 'rgb(255, 159, 64)', // Naranja
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    tension: 0.1, pointRadius: 4, pointHoverRadius: 6,
                    type: 'bar', // Mostrar ganancia como barras
                    yAxisID: 'yGanancia'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yPeso: {
                    position: 'left',
                    beginAtZero: false,
                    title: { display: true, text: 'Peso (kg)' }
                },
                yGanancia: {
                    position: 'right',
                    beginAtZero: true,
                    title: { display: true, text: 'Ganancia (kg)' },
                    grid: { drawOnChartArea: false }
                },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

// --- Gráfico Artritis (Nivel de Dolor) ---
function renderGraficoArtritisDolor() {
    const ctx = document.getElementById('graficoArtritisDolor')?.getContext('2d');
     const noDataMsg = document.getElementById('artritis-no-data');
     if (!ctx || !noDataMsg) {
         // console.error("Canvas o mensaje 'no data' para gráfico Artritis no encontrado.");
         return;
     }

     const data = store.getArtritisData() || [];

     if (data.length < 2) {
         noDataMsg.classList.remove('hidden');
         if (graficoArtritisDolorInstance) { graficoArtritisDolorInstance.destroy(); graficoArtritisDolorInstance = null; }
         return;
     } else {
         noDataMsg.classList.add('hidden');
     }

     const sortedData = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

     const labels = sortedData.map(d => formatLabelDate(d.date, d.time));
     const dolorData = sortedData.map(d => d.painLevel);

     if (graficoArtritisDolorInstance) { graficoArtritisDolorInstance.destroy(); }

     graficoArtritisDolorInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nivel de Dolor (0-10)',
                data: dolorData,
                borderColor: 'rgb(255, 99, 132)', // Rojo
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true, // Rellenar área bajo la línea
                // Colorear línea/puntos según severidad
                segment: {
                     borderColor: ctx => {
                         const y = ctx.p1.parsed.y;
                         if (y >= 8) return 'rgb(198, 40, 40)'; // Rojo oscuro (severo)
                         if (y >= 4) return 'rgb(230, 126, 34)'; // Naranja (moderado)
                         return 'rgb(46, 125, 50)'; // Verde (leve)
                     },
                     backgroundColor: ctx => {
                         const y = ctx.p1.parsed.y;
                         if (y >= 8) return 'rgba(198, 40, 40, 0.2)';
                         if (y >= 4) return 'rgba(230, 126, 34, 0.2)';
                         return 'rgba(46, 125, 50, 0.2)';
                     }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10, // Escala de 0 a 10
                    title: { display: true, text: 'Nivel de Dolor' }
                },
                 x: {
                     ticks: { maxRotation: 45, minRotation: 45 }
                 }
            },
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
             interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

// --- Función Principal ---
export function init() {
    console.log("Cargado js/pages/graficas.js (v3 - Todos los gráficos implementados)");

    // Verificar si Chart.js está cargado
    if (typeof Chart === 'undefined') {
        console.error("Chart.js no está cargado. Asegúrate de incluir el script en index.html.");
        const container = document.querySelector('.page-container');
        if (container) container.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Error: No se pudo cargar la biblioteca de gráficos.</p>';
        return;
    }

    // Renderizar todos los gráficos
    renderGraficoCardiaco();
    renderGraficoDiabetes();
    renderGraficoPesoRenal();
    renderGraficoArtritisDolor();
}