document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Lógica del Tema (Claro/Oscuro) ---
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const docElement = document.documentElement;

    // Función para aplicar el tema
    const applyTheme = (theme) => {
        docElement.setAttribute('data-theme', theme);
        sunIcon.classList.toggle('hidden', theme === 'dark');
        moonIcon.classList.toggle('hidden', theme === 'light');
        localStorage.setItem('theme', theme);
    };

    // Cargar tema guardado o preferido por el sistema
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const validThemes = ['light', 'dark'];
    const currentTheme = validThemes.includes(savedTheme) ? savedTheme : (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);

    // Evento del botón
    themeToggle.addEventListener('click', () => {
        const newTheme = docElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- 1. Estado y Selectores ---
    let currentSlide = 0;
    let quizPassed = false;
    
    const slides = document.querySelectorAll('.course-slide');
    const totalSlides = slides.length;
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const currentStepEl = document.getElementById('current-step');
    const totalStepsEl = document.getElementById('total-steps');
    const progressBar = document.getElementById('progress-bar');
    const quizForm = document.getElementById('quiz-form');
    const btnScoreQuiz = document.getElementById('btn-score-quiz');
    const quizResults = document.getElementById('quiz-results');
    const btnDownloadCert = document.getElementById('download-cert-btn');
    const studentNameInput = document.getElementById('student-name');
    
    totalStepsEl.textContent = totalSlides;

    // --- 2. Funciones de Navegación ---
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('hidden', i !== index);
        });
        
        currentSlide = index;
        currentStepEl.textContent = currentSlide + 1;
        
        const progressPercent = ((index + 1) / totalSlides) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressBar.setAttribute('aria-valuenow', progressPercent);
        
        updateNavButtons();
    }

    function updateNavButtons() {
        btnPrev.disabled = (currentSlide === 0);

        if (currentSlide === totalSlides - 1) {
            btnNext.disabled = true;
            btnNext.classList.add('hidden');
        } else if (currentSlide === 3 && !quizPassed) {
            btnNext.disabled = true;
        } else {
            btnNext.disabled = false;
            btnNext.classList.remove('hidden');
        }
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            showSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }
    
    // --- 3. Lógica del Quiz ---
    function scoreQuiz(e) {
        e.preventDefault();
        
        const formData = new FormData(quizForm);
        let score = 0;
        
        const answers = {
            q1: 'b',
            q2: 'false',
            q3: ['a', 'c'],
            q4: ['minutos']
        };

        if (formData.get('q1') === answers.q1) score++;
        if (formData.get('q2') === answers.q2) score++;
        
        const q3Selected = formData.getAll('q3');
        if (q3Selected.length === 2 && 
            q3Selected.includes(answers.q3[0]) && 
            q3Selected.includes(answers.q3[1])) {
            score++;
        }

        if (answers.q4.includes(formData.get('q4').toLowerCase().trim())) {
            score++;
        }

        quizResults.classList.remove('hidden');
        const passScore = 3;
        
        quizResults.classList.remove('quiz-pass', 'quiz-fail');
        
        if (score >= passScore) {
            quizPassed = true;
            quizResults.innerHTML = '';
            const p1 = document.createElement('p');
            p1.style.cssText = 'font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;';
            p1.textContent = `¡Excelente! Tu puntaje: ${score} / 4`;
            const p2 = document.createElement('p');
            p2.style.cssText = 'margin: 0;';
            p2.textContent = 'Has aprobado. Ya puedes avanzar a la sección final.';
            quizResults.appendChild(p1);
            quizResults.appendChild(p2);
            quizResults.classList.add('quiz-pass');
            btnScoreQuiz.disabled = true;
        } else {
            quizPassed = false;
            quizResults.innerHTML = '';
            const p1 = document.createElement('p');
            p1.style.cssText = 'font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;';
            p1.textContent = `Tu puntaje: ${score} / 4`;
            const p2 = document.createElement('p');
            p2.style.cssText = 'margin: 0;';
            p2.textContent = `Necesitas al menos ${passScore} correctas para avanzar. ¡Inténtalo de nuevo!`;
            quizResults.appendChild(p1);
            quizResults.appendChild(p2);
            quizResults.classList.add('quiz-fail');
        }
        
        updateNavButtons();
    }

    // --- 4. Lógica del Certificado ---
    function downloadCertificate() {
        const studentName = studentNameInput.value.trim() || "Estudiante Dedicado";
        
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        const isDark = docElement.getAttribute('data-theme') === 'dark';
        const bgColor = isDark ? '#212529' : '#ffffff';
        const textColor = isDark ? '#ffffff' : '#333333';
        const primaryColor = isDark ? '#6ea8fe' : '#003366';
        const accentColor = '#f0c04a';

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 15;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 5;
        ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICADO', canvas.width / 2, 120);
        
        ctx.font = '30px Arial';
        ctx.fillText('DE FINALIZACIÓN', canvas.width / 2, 170);

        ctx.fillStyle = textColor;
        ctx.font = '24px Arial';
        ctx.fillText('Otorgado a:', canvas.width / 2, 250);

        ctx.fillStyle = primaryColor;
        ctx.font = 'italic bold 40px "Times New Roman"';
        ctx.fillText(studentName, canvas.width / 2, 320);

        ctx.fillStyle = textColor;
        ctx.font = '24px Arial';
        ctx.fillText('Por completar exitosamente el curso', canvas.width / 2, 400);

        ctx.font = 'bold 28px Arial';
        ctx.fillText('"Introducción al Rapid Learning"', canvas.width / 2, 450);

        ctx.font = '20px Arial';
        ctx.fillText(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, canvas.width / 2, 530);

        const link = document.createElement('a');
        const safeName = studentName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ ]/g, '').replace(/ /g, '_');
        link.download = `Certificado_${safeName || 'Estudiante'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // --- 5. Asignación de Eventos ---
    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);
    btnScoreQuiz.addEventListener('click', scoreQuiz);
    btnDownloadCert.addEventListener('click', downloadCertificate);

    // --- 6. Inicialización ---
    showSlide(0);
});