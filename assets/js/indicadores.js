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
        const data = await fetchData(API_URL);
        renderIndicators(data);
    } catch (error) {
        handleFetchError(error);
    }
}

function renderIndicators(data) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object' && data[key].nombre) {
            const indicator = data[key];
            const formattedDate = formatDate(indicator.fecha);
            const card = document.createElement('div');
            card.className = 'card';
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = indicator.nombre;
            const text = document.createElement('p');
            text.className = 'card-text';

            const strongCodigo = document.createElement('strong');
            strongCodigo.textContent = 'Código: ';
            text.appendChild(strongCodigo);
            text.appendChild(document.createTextNode(key));
            text.appendChild(document.createElement('br'));

            const strongUnidad = document.createElement('strong');
            strongUnidad.textContent = 'Unidad Medida: ';
            text.appendChild(strongUnidad);
            text.appendChild(document.createTextNode(indicator.unidad_medida));
            text.appendChild(document.createElement('br'));

            const strongFecha = document.createElement('strong');
            strongFecha.textContent = 'Fecha: ';
            text.appendChild(strongFecha);
            text.appendChild(document.createTextNode(formattedDate));
            text.appendChild(document.createElement('br'));

            const strongValor = document.createElement('strong');
            strongValor.textContent = 'Valor: ';
            text.appendChild(strongValor);
            text.appendChild(document.createTextNode(indicator.valor));

            cardBody.appendChild(title);
            cardBody.appendChild(text);
            card.appendChild(cardBody);
            container.appendChild(card);
        }
    });
}

function handleFetchError(error) {
    console.error('Error fetching data:', error);
    const container = document.getElementById('cards-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = 'error-alert';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.setAttribute('aria-live', 'assertive');
    alertDiv.textContent = 'No se pudieron cargar los datos. Por favor, verifica tu conexión a internet o intenta nuevamente más tarde.';
    container.innerHTML = '';
    container.appendChild(alertDiv);
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