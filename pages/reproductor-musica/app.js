(() => {
    'use strict';
    // Instancia del elemento Audio nativo de JavaScript
    const audio = new Audio();
    // Lista de pistas en la playlist
    let playlist = [];
    // Índice de la pista actual en la playlist
    let currentIndex = -1;
    //Formatea el tiempo en formato MM:SS
    const formatTime = (s) => {
        if (isNaN(s) || !isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };
    // Objeto que almacena referencias a los elementos DOM del reproductor
    // para evitar consultas repetidas con getElementById

    const dom = {
        playBtn: document.getElementById('playBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        progressBar: document.getElementById('progressBar'),
        progressFill: document.getElementById('progressFill'),
        currentTime: document.getElementById('currentTime'),
        duration: document.getElementById('duration'),
        volumeSlider: document.getElementById('volumeSlider'),
        volumeBtn: document.getElementById('volumeBtn'),
        trackName: document.getElementById('trackName'),
        trackInfo: document.getElementById('trackInfo'),
        coverIcon: document.getElementById('coverIcon'),
        playlist: document.getElementById('playlist'),
        fileInput: document.getElementById('fileInput'),
        addBtn: document.getElementById('addBtn'),
        mainContent: document.querySelector('.main-content'),
        themeToggle: document.getElementById('themeToggle'),
    };

    //Renderiza la lista de reproducción en el DOM

    function renderPlaylist() {
        dom.playlist.innerHTML = '';
        if (playlist.length === 0) {
            dom.playlist.innerHTML = '<li class="empty-playlist">Arrastra archivos de audio o haz clic en &quot;Agregar canciones&quot;</li>';
            return;
        }
        playlist.forEach((track, i) => {
            const li = document.createElement('li');
            li.className = 'playlist-item' + (i === currentIndex ? ' active' : '');
            li.dataset.index = i;

            const icon = document.createElement('span');
            icon.className = 'track-icon';
            icon.textContent = i === currentIndex && !audio.paused ? '▶' : '🎵';

            const name = document.createElement('span');
            name.className = 'track-name';
            name.textContent = track.name;

            const dur = document.createElement('span');
            dur.className = 'track-duration';
            dur.textContent = formatTime(track.duration);

            const remove = document.createElement('button');
            remove.className = 'remove-btn';
            remove.innerHTML = '✕';
            remove.title = 'Eliminar';
            remove.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTrack(i);
            });

            li.appendChild(icon);
            li.appendChild(name);
            li.appendChild(dur);
            li.appendChild(remove);

            li.addEventListener('click', () => {
                if (i === currentIndex) {
                    togglePlay();
                } else {
                    playTrack(i);
                }
            });

            dom.playlist.appendChild(li);
        });
    }

    // Actualiza la interfaz de usuario del reproductor según la pista actual

    function updatePlayerUI() {
        if (currentIndex === -1 || !playlist[currentIndex]) {
            dom.trackName.textContent = 'Ninguna canción seleccionada';
            dom.trackInfo.textContent = 'Agrega canciones para comenzar';
            dom.playBtn.textContent = '▶';
            dom.progressFill.style.width = '0%';
            dom.currentTime.textContent = '0:00';
            dom.duration.textContent = '0:00';
            return;
        }
        const track = playlist[currentIndex];
        dom.trackName.textContent = track.name;
        dom.trackInfo.textContent = formatTime(track.duration);
        dom.playBtn.textContent = audio.paused ? '▶' : '⏸';
        dom.duration.textContent = formatTime(track.duration || audio.duration);
    }
    //Reproduce una pista específica del playlist
    function playTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        if (currentIndex !== index) {
            currentIndex = index;
            const track = playlist[currentIndex];
            audio.src = track.url;
            audio.load();
        }
        audio.play().catch(() => { });
    }
    //Alterna entre play y pause
    function togglePlay() {
        if (playlist.length === 0) return;
        if (currentIndex === -1) {
            playTrack(0);
            return;
        }
        if (audio.paused) {
            audio.play().catch(() => { });
        } else {
            audio.pause();
        }
    }
    //Reproduce la siguiente pista en la playlist
    function playNext() {
        if (playlist.length === 0) return;
        const next = (currentIndex + 1) % playlist.length;
        playTrack(next);
    }
    //Reproduce la pista anterior en la playlist
    function playPrev() {
        if (playlist.length === 0) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        const prev = (currentIndex - 1 + playlist.length) % playlist.length;
        playTrack(prev);
    }
    //Elimina una pista de la playlist
    function removeTrack(index) {
        const wasCurrent = index === currentIndex;
        const wasPlaying = wasCurrent && !audio.paused;
        playlist.splice(index, 1);
        if (wasCurrent) {
            audio.pause();
            audio.src = '';
            if (playlist.length > 0) {
                const newIdx = Math.min(index, playlist.length - 1);
                if (wasPlaying) {
                    playTrack(newIdx);
                } else {
                    currentIndex = newIdx;
                    updatePlayerUI();
                }
            } else {
                currentIndex = -1;
                updatePlayerUI();
                renderPlaylist();
                return;
            }
        } else if (index < currentIndex) {
            currentIndex--;
        }
        renderPlaylist();
    }
    //Carga archivos de audio del sistema y los agrega a la playlist
    function loadFiles(files) {
        const valid = [];
        for (const file of files) {
            if (!file.type.startsWith('audio/')) continue;
            const url = URL.createObjectURL(file);
            valid.push({ id: crypto.randomUUID(), name: file.name, url, duration: 0, file });
        }
        if (valid.length === 0) return;
        if (playlist.length === 0 && currentIndex === -1) {
            playlist = valid;
            playTrack(0);
        } else {
            const prevLen = playlist.length;
            playlist.push(...valid);
            if (currentIndex === -1) {
                playTrack(prevLen);
            }
        }
        renderPlaylist();
    }
    //Maneja el evento de arrastre y soltura para agregar archivos
    function handleDrop(e) {
        e.preventDefault();
        dom.mainContent.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) loadFiles(files);
    }
    //Actualiza la barra de progreso según el tiempo actual de reproducción
    function updateProgress() {
        if (!audio.duration || isNaN(audio.duration)) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        dom.progressFill.style.width = Math.min(pct, 100) + '%';
        dom.currentTime.textContent = formatTime(audio.currentTime);
    }

    function onTimeUpdate() {
        updateProgress();
    }
    //Obtiene la duración completa de una pista al cargar metadata
    function onLoadedMetadata() {
        if (currentIndex >= 0 && playlist[currentIndex]) {
            playlist[currentIndex].duration = audio.duration;
            dom.duration.textContent = formatTime(audio.duration);
            dom.trackInfo.textContent = formatTime(audio.duration);
            renderPlaylist();
        }
    }
    //Maneja el evento ended del elemento audio
    function onEnded() {
        if (playlist.length > 1) playNext();
        else {
            audio.currentTime = 0;
            updatePlayerUI();
            renderPlaylist();
        }
    }
    //Actualiza la UI al iniciar reproducción de una pista
    function onPlay() {
        updatePlayerUI();
        renderPlaylist();
    }
    //Actualiza la UI al pausar reproducción de una pista
    function onPause() {
        updatePlayerUI();
        renderPlaylist();
    }
    //Permite cambiar la posición de reproducción al hacer clic en la barra
    function seek(e) {
        const rect = dom.progressBar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (audio.duration) {
            audio.currentTime = pct * audio.duration;
        }
    }
    // Inicializa el reproductor de música
    // Configura los event listeners y actualiza la UI inicial

    function init() {
        dom.playBtn.addEventListener('click', togglePlay);
        dom.prevBtn.addEventListener('click', playPrev);
        dom.nextBtn.addEventListener('click', playNext);

        dom.progressBar.addEventListener('click', seek);

        dom.volumeSlider.addEventListener('input', () => {
            audio.volume = parseFloat(dom.volumeSlider.value);
            dom.volumeBtn.textContent = audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊';
        });
        dom.volumeBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.dataset.prevVolume = audio.volume;
                audio.volume = 0;
                dom.volumeSlider.value = 0;
                dom.volumeBtn.textContent = '🔇';
            } else {
                audio.volume = parseFloat(audio.dataset.prevVolume) || 0.8;
                dom.volumeSlider.value = audio.volume;
                dom.volumeBtn.textContent = audio.volume < 0.5 ? '🔉' : '🔊';
            }
        });
        audio.volume = parseFloat(dom.volumeSlider.value);

        dom.fileInput.addEventListener('change', () => {
            if (dom.fileInput.files.length > 0) {
                loadFiles(dom.fileInput.files);
                dom.fileInput.value = '';
            }
        });
        dom.addBtn.addEventListener('click', () => dom.fileInput.click());

        dom.mainContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            dom.mainContent.classList.add('drag-over');
        });
        dom.mainContent.addEventListener('dragleave', (e) => {
            if (!dom.mainContent.contains(e.relatedTarget)) {
                dom.mainContent.classList.remove('drag-over');
            }
        });
        dom.mainContent.addEventListener('drop', handleDrop);

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        dom.themeToggle.addEventListener('click', () => {
            const c = document.documentElement.getAttribute('data-theme');
            const n = c === 'light' ? 'dark' : 'light';
            if (n === 'light') document.documentElement.setAttribute('data-theme', 'light');
            else document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', n);
        });
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        updatePlayerUI();
        renderPlaylist();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
