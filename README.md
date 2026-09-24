# Rosell — Portafolio Full Stack

Portafolio estático con Astro, TypeScript y Three.js. Diseño monocromático, superficies de vidrio discretas y un laboratorio visual inspirado en dinámica de fluidos.

## Desarrollo

Requiere Node.js 22.12 o posterior.

Las versiones están fijadas en `package.json` y `package-lock.json`. Se fija `unifont` a 0.7.4 mediante `overrides`: la 0.7.5 introduce `undici` 8, que requiere Node 22.19, superior al Node 22.14 del entorno original. Revisar este ajuste al actualizar Node/Astro. No se usan proveedores remotos de fuentes.

```sh
npm install
npm run dev
```

Abrir la URL local que muestra Astro (normalmente `http://localhost:4321`). En PowerShell con ejecución de scripts restringida, usar `npm.cmd` en lugar de `npm`.

```sh
npm run check  # Astro y TypeScript
npm run build  # Validación y generación estática en dist/
npm run preview
npm test       # Pruebas de navegación, controles y alternativas accesibles
```

Las pruebas usan Chrome instalado localmente. Alternativamente, instalar Chromium con `npx playwright install chromium` y ejecutar con `PLAYWRIGHT_CHROMIUM=1`.

## Organización

- `src/pages/`: inicio, `/proyectos/[slug]/`, `/lab/vortex/` y 404.
- `src/layouts/`: documento HTML, metadatos y estructura compartida.
- `src/components/`: navegación, secciones, tarjetas y superficie del vórtice.
- `src/styles/tokens.css`: paleta, tipografía, espaciado base y bordes.
- `src/styles/global.css`: composición adaptable y tratamiento de vidrio.
- `src/data/profile.ts`: nombre, contacto, redes y habilidades.
- Contacto: «Escríbeme», «Email» y la dirección visible abren Gmail web en otra pestaña con el destinatario predefinido. «Usar mi aplicación de correo» mantiene la alternativa `mailto:`. La dirección se define una sola vez en `src/data/profile.ts`.
- `src/data/project-gallery.ts`: las seis tarjetas de demos públicas bajo el trabajo destacado.
- `src/content/projects/`: proyectos en Markdown.
- `src/content.config.ts`: esquema validado de proyectos.
- `src/graphics/vortex/`: motor Three.js, configuración, partículas y shaders.
- `src/scripts/vortex-element.ts`: ciclo de vida, carga diferida y controles accesibles.
- `src/assets/profile/`: fotografía procesada por Astro.
- `public/`: archivos copiados directamente al build.
- `legacy/`: prototipos originales archivados, fuera del build.

## Editar contenido

Crear un archivo Markdown en `src/content/projects/` con los campos del proyecto de ejemplo. El nombre del archivo define su ruta. `featured: true` lo muestra en el inicio. `repository` y `demo` son URLs opcionales: sólo se muestran si están definidas.

La galería bajo el destacado se edita en `src/data/project-gallery.ts`: `title`, `href`, `technologies` y `preview` (opcional). Las primeras dos tarjetas usan las demos Airbnb Fancy y Boleli con capturas locales en `public/projects/`. Las cuatro restantes son espacios provisionales y alternan las mismas dos URLs. Sustituirlas por sus destinos definitivos cuando estén disponibles. El stack provisional de las seis tarjetas es React, TypeScript, Vite, React Router, CSS y ESLint; se puede modificar por proyecto. Toda la tarjeta es un enlace que abre otra pestaña, también accesible mediante teclado; la rejilla tiene 3, 2 o 1 columnas según el ancho de pantalla.

El texto de My Business FastAPI procede de la landing proporcionada; no se han añadido cifras de resultados ni enlaces inventados. Antes de publicar:

- Confirmar `contacto@rosell.dev`, conservado del prototipo.
- Añadir URLs personales a `profile.socials` y enlaces reales del proyecto.
- Completar el caso de estudio con capturas, contribuciones y resultados verificables.
- Configurar `site` en `astro.config.mjs` al disponer del dominio definitivo; añadir canonical y sitemap en ese momento.

## Vidrio y movimiento

Las superficies de interfaz usan CSS: transparencias, desenfoque y reflejos de borde. No refractan físicamente el DOM. El objeto del escenario WebGL usa `MeshPhysicalMaterial` con transmisión, espesor e índice de refracción (IOR 1.45), más iluminación de entorno y un fondo opaco que se refracta. Es una aproximación de renderizado en tiempo real, no trazado de rayos.

El campo de partículas reutiliza las reglas de giro, convergencia y chorros del prototipo. No es un solver Navier–Stokes. Ahora el avance usa tiempo transcurrido y suavizado independiente de los FPS, con un límite por paso. La densidad inicial disminuye en pantallas pequeñas; el DPR está limitado a 1.5.

Three.js se importa al entrar la escena en pantalla. La animación se detiene fuera de vista, al ocultar la pestaña o al pulsar pausa. Geometrías, materiales, controles y recursos de entorno se liberan al desmontar. Se muestra una composición CSS estática sin cargar el motor cuando se solicita movimiento reducido; también se usa ante errores de WebGL. El contenido y la navegación funcionan sin JavaScript.

Vite advierte que el módulo 3D supera 500 kB minificados (aproximadamente 570 kB antes de compresión). Se descarga por separado y sólo en las rutas con escena cuando entra en pantalla. Las pruebas de navegador verifican funcionamiento, no certifican el rendimiento en teléfonos físicos.

## Migración

La antigua landing está dividida en Hero, FeaturedProjects, AboutBento, Stack y Contact. Se retiraron colores saturados, métricas sin verificar, enlaces sociales genéricos y la etiqueta ambigua FlashAPI. El desplazamiento usa el navegador; Lenis y las dependencias por CDN se sustituyeron por código modular y paquetes npm con lockfile.

## Publicación

Ejecutar `npm run build` y publicar `dist/` en un hosting estático. No requiere servidor de aplicación, base de datos ni secretos. Los archivos de `legacy/` no se publican.
