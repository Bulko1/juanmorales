(() => {
    'use strict';

    const STORAGE_KEY = 'markdown-editor-content';
    const THEME_KEY = 'theme';

    const SAMPLE_DOC = `# Editor Markdown en vivo

Bienvenido al **editor Markdown** del portafolio. Todo lo que escribas en el panel izquierdo se renderiza en tiempo real aquí a la derecha.

## Características

- Render en vivo con soporte **GFM** (GitHub Flavored Markdown)
- Autoguardado local en el navegador
- Exporta a \`.md\` o \`.html\`
- Modo claro y oscuro
- Atajos de teclado y barra de herramientas
- Arrastra un archivo \`.md\` para importarlo

## Sintaxis soportada

Puedes combinar **negrita**, *cursiva*, ~~tachado~~ y \`código en línea\`.

> Las citas se ven así, con una barra lateral de acento.

### Listas de tareas

- [x] Parser de Markdown GFM
- [x] Autoguardado en localStorage
- [x] Export a .md y .html
- [x] Tema claro/oscuro
- [ ] ¿Algo más que se te ocurra?

### Código

\`\`\`javascript
function saludar(nombre) {
    return \`Hola, \${nombre}!\`;
}

console.log(saludar('Juan'));
\`\`\`

### Tablas

| Función          | Soporte | Notas                     |
|------------------|:-------:|---------------------------|
| Encabezados      |   Sí    | h1 a h6                   |
| Énfasis          |   Sí    | bold, italic, strike      |
| Listas           |   Sí    | ul, ol, task              |
| Tablas GFM       |   Sí    | con alineación            |
| Código           |   Sí    | inline + bloque           |

### Enlaces e imágenes

Visita [mi portafolio](../../) o echa un vistazo a la [documentación de Markdown](https://commonmark.org).

![Logo Markdown](https://placehold.co/600x200/1f2937/38bdf8?text=Markdown+Editor)

---

¡Edita este texto o empieza desde cero con el botón **Ejemplo** / **Limpiar**!
`;

    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const fileInput = document.getElementById('file-input');
    const editorWrap = document.getElementById('editor-wrap');
    const workspace = document.getElementById('workspace');

    const statWords = document.getElementById('stat-words');
    const statChars = document.getElementById('stat-chars');
    const statLines = document.getElementById('stat-lines');
    const statRead = document.getElementById('stat-read');
    const statSaved = document.getElementById('stat-saved');
    const editorMeta = document.getElementById('editor-meta');
    const toast = document.getElementById('toast');
    const iconDark = document.getElementById('icon-dark');
    const iconLight = document.getElementById('icon-light');

    let saveTimer = null;
    let isProgrammaticChange = false;

    const showToast = (msg) => {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
    };

    const initTheme = () => {
        const saved = localStorage.getItem(THEME_KEY);
        const theme = saved === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    };

    const updateThemeIcon = (theme) => {
        if (theme === 'light') {
            iconDark.classList.remove('hidden');
            iconLight.classList.add('hidden');
        } else {
            iconDark.classList.add('hidden');
            iconLight.classList.remove('hidden');
        }
    };

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeIcon(next);
    };

    document.getElementById('btn-theme').addEventListener('click', toggleTheme);

    const render = () => {
        const md = editor.value;
        const html = MarkdownParser.render(md);
        if (html.trim() === '') {
            preview.innerHTML = '<p class="preview-empty">La vista previa aparecerá aquí en tiempo real.</p>';
        } else {
            preview.innerHTML = html;
        }
        updateStats(md);
    };

    const updateStats = (text) => {
        const chars = text.length;
        const lines = text === '' ? 0 : text.split('\n').length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / 200));
        statChars.textContent = `${chars.toLocaleString('es-CL')} caracteres`;
        statWords.textContent = `${words.toLocaleString('es-CL')} palabras`;
        statLines.textContent = `${lines.toLocaleString('es-CL')} líneas`;
        statRead.textContent = `${minutes} min lectura`;
        editorMeta.textContent = `${lines.toLocaleString('es-CL')} líneas`;
    };

    const scheduleSave = () => {
        statSaved.textContent = 'Guardando…';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, editor.value);
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            statSaved.textContent = `Guardado · ${hh}:${mm}`;
        }, 300);
    };

    let renderScheduled = false;
    const scheduleRender = () => {
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            renderScheduled = false;
            render();
        });
    };

    editor.addEventListener('input', () => {
        if (isProgrammaticChange) return;
        scheduleRender();
        scheduleSave();
    });

    const loadSaved = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved.trim() !== '') {
            isProgrammaticChange = true;
            editor.value = saved;
            isProgrammaticChange = false;
        } else {
            isProgrammaticChange = true;
            editor.value = SAMPLE_DOC;
            isProgrammaticChange = false;
        }
        render();
    };

    loadSaved();

    document.getElementById('btn-sample').addEventListener('click', () => {
        if (editor.value.trim() !== '' && !confirm('¿Reemplazar el contenido actual por el ejemplo?')) return;
        isProgrammaticChange = true;
        editor.value = SAMPLE_DOC;
        isProgrammaticChange = false;
        render();
        scheduleSave();
        showToast('Ejemplo cargado');
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (editor.value.trim() !== '' && !confirm('¿Limpiar el editor?')) return;
        isProgrammaticChange = true;
        editor.value = '';
        isProgrammaticChange = false;
        render();
        scheduleSave();
        showToast('Editor limpio');
    });

    document.getElementById('btn-import').addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        readFile(file);
        fileInput.value = '';
    });

    const readFile = (file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            isProgrammaticChange = true;
            editor.value = ev.target.result;
            isProgrammaticChange = false;
            render();
            scheduleSave();
            showToast(`Importado: ${file.name}`);
        };
        reader.onerror = () => showToast('Error al leer el archivo');
        reader.readAsText(file);
    };

    let dragCounter = 0;
    editorWrap.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        editorWrap.classList.add('dragging');
    });
    editorWrap.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    editorWrap.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            editorWrap.classList.remove('dragging');
        }
    });
    editorWrap.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        editorWrap.classList.remove('dragging');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!/\.(md|markdown|txt)$/i.test(file.name)) {
            showToast('Solo se admiten archivos .md o .txt');
            return;
        }
        readFile(file);
    });

    const downloadFile = (content, filename, mime) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    document.getElementById('btn-export-md').addEventListener('click', () => {
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadFile(editor.value, `documento-${ts}.md`, 'text/markdown;charset=utf-8');
        showToast('Archivo .md descargado');
    });

    const buildHtmlDoc = (body) => {
        return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Documento Markdown</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1f2937; }
h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin-top: 1.5em; }
h1 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 0.3rem; font-family: 'JetBrains Mono', Consolas, monospace; }
pre { background: #1f2937; color: #f9fafb; padding: 1em; border-radius: 0.5rem; overflow-x: auto; }
pre code { background: none; color: inherit; padding: 0; }
blockquote { border-left: 4px solid #38bdf8; padding: 0.5em 1em; background: #f0f9ff; margin: 1em 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #e5e7eb; padding: 0.5em 0.75em; text-align: left; }
th { background: #f9fafb; }
img { max-width: 100%; border-radius: 0.5rem; }
hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.6em 0; }
.task-item { list-style: none; }
</style>
</head>
<body>
${body}
</body>
</html>`;
    };

    document.getElementById('btn-export-html').addEventListener('click', () => {
        const html = MarkdownParser.render(editor.value);
        const doc = buildHtmlDoc(html);
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadFile(doc, `documento-${ts}.html`, 'text/html;charset=utf-8');
        showToast('Archivo .html descargado');
    });

    document.getElementById('btn-copy-html').addEventListener('click', async () => {
        const html = MarkdownParser.render(editor.value);
        try {
            await navigator.clipboard.writeText(html);
            showToast('HTML copiado al portapapeles');
        } catch (err) {
            const ta = document.createElement('textarea');
            ta.value = html;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                showToast('HTML copiado al portapapeles');
            } catch (e) {
                showToast('No se pudo copiar');
            }
            document.body.removeChild(ta);
        }
    });

    const wrapSelection = (left, right = left, placeholder = '') => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.substring(start, end);
        const text = selected || placeholder;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        const newText = before + left + text + right + after;
        isProgrammaticChange = true;
        editor.value = newText;
        isProgrammaticChange = false;
        const newPos = start + left.length + text.length;
        editor.focus();
        editor.setSelectionRange(newPos, newPos);
        render();
        scheduleSave();
    };

    const prefixLines = (prefix) => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const segment = value.substring(lineStart, end);
        const prefixed = segment.split('\n').map(l => prefix + l).join('\n');
        isProgrammaticChange = true;
        editor.value = value.substring(0, lineStart) + prefixed + value.substring(end);
        isProgrammaticChange = false;
        editor.focus();
        editor.setSelectionRange(lineStart, lineStart + prefixed.length);
        render();
        scheduleSave();
    };

    const insertAtCursor = (text) => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        isProgrammaticChange = true;
        editor.value = value.substring(0, start) + text + value.substring(end);
        isProgrammaticChange = false;
        const newPos = start + text.length;
        editor.focus();
        editor.setSelectionRange(newPos, newPos);
        render();
        scheduleSave();
    };

    const actions = {
        h1: () => prefixLines('# '),
        h2: () => prefixLines('## '),
        h3: () => prefixLines('### '),
        bold: () => wrapSelection('**', '**', 'texto en negrita'),
        italic: () => wrapSelection('*', '*', 'cursiva'),
        strike: () => wrapSelection('~~', '~~', 'tachado'),
        link: () => wrapSelection('[', '](https://)', 'texto del enlace'),
        image: () => wrapSelection('![', '](https://)', 'texto alternativo'),
        code: () => wrapSelection('`', '`', 'código'),
        codeblock: () => insertAtCursor('\n```\ncódigo aquí\n```\n'),
        ul: () => prefixLines('- '),
        ol: () => prefixLines('1. '),
        task: () => prefixLines('- [ ] '),
        quote: () => prefixLines('> '),
        hr: () => insertAtCursor('\n---\n'),
        table: () => insertAtCursor('\n| Columna 1 | Columna 2 | Columna 3 |\n|-----------|-----------|-----------|\n| Celda     | Celda     | Celda     |\n| Celda     | Celda     | Celda     |\n')
    };

    document.querySelectorAll('.toolbar [data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (actions[action]) actions[action]();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (!editor.matches(':focus')) return;
        const meta = e.ctrlKey || e.metaKey;

        if (meta && e.key === 's') {
            e.preventDefault();
            document.getElementById('btn-export-md').click();
            return;
        }

        if (!meta) return;

        const key = e.key.toLowerCase();
        if (key === 'b') {
            e.preventDefault();
            actions.bold();
        } else if (key === 'i') {
            e.preventDefault();
            actions.italic();
        } else if (key === 'k' && !e.shiftKey) {
            e.preventDefault();
            actions.link();
        } else if (key === 'k' && e.shiftKey) {
            e.preventDefault();
            actions.image();
        }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            workspace.classList.toggle('editor-mode', tab === 'editor');
            workspace.classList.toggle('preview-mode', tab === 'preview');
        });
    });

    initTheme();
})();
