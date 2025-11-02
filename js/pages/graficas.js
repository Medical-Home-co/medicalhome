/* --- js/pages/graficas.js --- */
import { store } from '../store.js';

// Lista de todas las claves de datos que pueden generar un gráfico
const dataKeys = [
    'renal', 'cardiaco', 'diabetes', 'artritis', 
    'tea', 'respiratorio', 'gastrico', 'ocular', 'general'
];

/**
 * Función principal de inicialización
 */
export function init() {
    const chartsContainer = document.getElementById('charts-grid');
    if (!chartsContainer) return;

    // 1. Cargar todos los datos
    const allData = {};
    dataKeys.forEach(key => {
        allData[key] = store.get(key); // Asumiendo que store.get(key) es tu método
    });

    // 2. Comprobar si hay *algún* dato
    const hasAnyData = dataKeys.some(key => {
        const data = allData[key];
        if (key === 'renal') return data && data.bcmHistory && data.bcmHistory.length > 0;
        if (key === 'ocular') return data && data.examHistory && data.examHistory.length > 0;
        return Array.isArray(data) && data.length > 0;
    });

    // 3. Decidir qué renderizar
    if (!hasAnyData) {
        // SOLUCIÓN: Mostrar el aviso de "sin datos"
        chartsContainer.innerHTML = `
            <div class="empty-state-container" style="text-align: center; margin-top: 2rem; grid-column: 1 / -1;">
                <img src="images/icons/chart-area.svg" alt="Gráficas" style="width: 80px; height: 80px; margin: 1rem auto; opacity: 0.5;">
                <h2 class="modal-title">Gráficas de Seguimiento</h2>
                <p class="modal-subtitle" style="max-width: 500px; margin: 0 auto 1.5rem;">
                    Esta sección genera gráficos automáticamente a medida que guardas registros
                    en tus secciones de "Condición Médica" (ej. Renal, Cardiaco, Diabetes, etc.).
                </p>
                <p class="modal-subtitle" style="max-width: 500px; margin: 0 auto 1.5rem;">
                    ¡Empieza a guardar registros para ver tu progreso!
                </p>
            </div>
        `;
    } else {
        // SOLUCIÓN: Hay datos, renderizar solo los gráficos que aplican
        chartsContainer.innerHTML = ''; // Limpiar
        
        // (Aquí iría tu lógica para llamar a cada función de renderizado)
        // Cada una de estas funciones debe crear un <canvas> y dibujarlo
        
        // if (allData['renal']?.bcmHistory?.length > 0) {
        //     chartsContainer.innerHTML += '<div class="chart-card"><canvas id="renal-chart"></canvas></div>';
        //     renderRenalChart(allData['renal']); 
        // }
        // if (allData['cardiaco']?.length > 0) {
        //     chartsContainer.innerHTML += '<div class="chart-card"><canvas id="cardiaco-chart"></canvas></div>';
        //     renderCardiacoChart(allData['cardiaco']);
        // }
        // ... y así sucesivamente para cada gráfico ...
        
        // --- Mensaje temporal mientras construyes los gráficos ---
        if (chartsContainer.innerHTML === '') {
             chartsContainer.innerHTML = `<p>Error: Se detectaron datos, pero las funciones de renderizado de gráficos no están implementadas.</p>`;
        }
    }
}

// (Aquí deberías tener tus funciones como renderRenalChart(data), etc.)