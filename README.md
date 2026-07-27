# JM - Portafolio de Proyectos Web

Portafolio profesional con proyectos web estáticos desarrollados con HTML, CSS y JavaScript. Sin frameworks, bundlers ni paquetes npm. Todos los proyectos se sirven desde un solo contenedor Docker.

## Estructura de Directorios

```
JM/
├── index.html                        # Página principal del portafolio
├── RL.html                           # Curso interactivo de Rapid Learning (CSS puro)
├── Encuesta.html                     # Formulario de encuesta de satisfacción
├── Indicadores.html                  # Dashboard de indicadores económicos (CSS puro)
├── main.js                           # Lógica de navegación, menú y tema
├── styles.css                        # Estilos principales del portafolio
├── favicon.ico
├── Dockerfile                        # Contenedor Docker (Nginx Alpine)
├── nginx.conf                        # Configuración de Nginx con headers de seguridad
│
├── assets/                           # Recursos compartidos
│   ├── css/indicadores.css           # Estilos del dashboard de indicadores
│   ├── js/indicadores.js             # Lógica de consumo de API para indicadores
│   ├── img/perfil.jpeg               # Imagen de perfil
│   └── fonts/NotoSans-Light.ttf      # Fuente local
│
└── pages/                            # Proyectos standalone
    ├── cursos/                       # Cursos interactivos
    │   ├── index.html                # Landing con 3 cursos
    │   ├── rapid-learning.html       # Rapid Learning (versión CSS puro)
    │   ├── seguridad.html            # Curso de Seguridad en Hogar y Oficina
    │   ├── guia.md
    │   └── assets/                   # JS y CSS locales del curso
    ├── reproductor-musica/           # Reproductor de música con playlist
    │   ├── index.html
    │   ├── styles.css
    │   └── app.js
    ├── markdown/                     # Editor Markdown en vivo (CSS puro)
    │   ├── index.html
    │   ├── parser.js
    │   └── app.js
    └── herramientas/                 # Herramientas web
        ├── index.html                # Landing con 6 herramientas
        ├── generador-contrasenas.html
        ├── contador-palabras.html
        ├── conversor-unidades.html
        ├── lista-tareas.html
        ├── generador-paleta.html
        └── redimensionar-imagen.html
```

## Proyectos

| Proyecto | Descripción | Tecnología | Ejecución |
|---|---|---|---|
| Portafolio | Página principal con navegación y temas | HTML/CSS/JS puro | Abrir `index.html` |
| RL.html | Curso Rapid Learning con quiz y certificado | HTML/CSS/JS + Canvas API | Abrir `RL.html` |
| Encuesta | Formulario de satisfacción interactivo | HTML/CSS/JS | Abrir `Encuesta.html` |
| Indicadores | Dashboard de indicadores económicos | HTML/CSS/JS + API REST | Abrir `Indicadores.html` |
| Cursos | 3 cursos interactivos con quizzes y certificados | HTML/CSS/JS + Canvas API | `pages/cursos/` |
| Editor Markdown | Editor en vivo con parser GFM, export y autoguardado | HTML/CSS/JS puro | `pages/markdown/index.html` |
| Reproductor Música | Reproductor de audio con playlist dinámica y drag & drop | HTML/CSS/JS + Web Audio API | `pages/reproductor-musica/` |
| Herramientas | 6 utilidades web (contraseñas, palabras, unidades, tareas, paletas, imágenes) | HTML/CSS/JS | `pages/herramientas/` |

## Tecnologías

- **HTML5** semántico y accesible
- **CSS3** con variables CSS, Grid, Flexbox, glassmorphism
- **JavaScript** vanilla (ES6+)
- **Canvas API** para manipulación de imágenes y certificados
- **Web Crypto API** para generación criptográfica de contraseñas
- **Nginx** como servidor en contenedor Docker
- **API mindicador.cl** para datos económicos en tiempo real

## Cómo Ejecutar

### Opción 1: Abrir directamente

Abre `index.html` en tu navegador. Todas las páginas enlazadas desde el portafolio funcionan con rutas relativas.

### Opción 2: Docker

```bash
docker build -t portafolio-jm .
docker run -p 8080:80 portafolio-jm
```

El portafolio estará disponible en `http://localhost:8080`.

## Sistema de Temas

- **Tema oscuro**: Predeterminado (`data-theme="dark"` o sin atributo)
- **Tema claro**: `data-theme="light"`
- **Persistencia**: `localStorage` con clave `theme`

## Seguridad

- Headers CSP en cada página HTML
- Sanitización XSS con `textContent` y `createTextNode`
- Configuración Nginx con headers de seguridad (`nginx.conf`)
- Atributo `sandbox` en iframes de YouTube
