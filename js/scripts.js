const API_URL = 'https://mindicador.cl/api';

async function fetchData(url = API_URL) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function updateIndicators() {
    try {
        const data = await fetchData('https://mindicador.cl/api');
        renderIndicators(data);
    } catch (error) {
        handleFetchError(error);
    }
}

function renderIndicators(data) {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Limpiar contenido existente
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object' && data[key].nombre) {
            const indicator = data[key];
            const formattedDate = formatDate(indicator.fecha);
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${indicator.nombre}</h5>
                        <p class="card-text">
                            <strong>Código:</strong> ${key}<br>
                            <strong>Unidad Medida:</strong> ${indicator.unidad_medida}<br>
                            <strong>Fecha:</strong> ${formattedDate}<br>
                            <strong>Valor:</strong> ${indicator.valor}
                        </p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

function handleFetchError(error) {
    console.error('Error fetching data:', error);
    const container = document.getElementById('cards-container');
    const errorMessage = `No se pudieron cargar los datos. Por favor, verifica tu conexión a internet o intenta nuevamente más tarde.`;
    container.innerHTML = `
        <div class="alert alert-danger" role="alert" aria-live="assertive">
            ${errorMessage}
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const DARK_MODE_ICON = '🌙';
const LIGHT_MODE_ICON = '☀️';

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeIcon.textContent = document.body.classList.contains('dark-mode') ? DARK_MODE_ICON : LIGHT_MODE_ICON;
});

let intervalId;

function startAutoRefresh() {
    intervalId = setInterval(updateIndicators, 60000);
}

function stopAutoRefresh() {
    clearInterval(intervalId);
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        startAutoRefresh();
        updateIndicators(); // Consultar inmediatamente cuando el usuario regresa
    } else {
        stopAutoRefresh();
    }
});

// Iniciar la consulta de datos al cargar la página
updateIndicators();
startAutoRefresh();