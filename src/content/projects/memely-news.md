---
title: Memely News
description: Búsqueda de noticias y consultas con IA desde una interfaz web o una CLI, con fuentes consultables y control de uso.
category: Backend e IA · Investigación de noticias
technologies: [Python, FastAPI, JavaScript, Redis, OpenAI, Gemini]
featured: false
order: 2
preview: /projects/memely-news.png
previewAlt: Interfaz de Memely News para buscar noticias y realizar consultas con IA
demo: https://memely-news.vercel.app/
---

## El problema

Reunir noticias de distintas fuentes y hacer preguntas sobre ellas sin perder las referencias ni dejar sin control las consultas a proveedores de IA.

## Mi aporte

Desarrollo de la API con FastAPI, la interfaz web y la CLI. Integración de The Guardian y NewsAPI como fuentes, y de OpenAI y Gemini para el análisis, con una capa de servicios compartida por ambos puntos de entrada.

## Decisiones técnicas

- **Lógica compartida:** los contratos HTTP y la CLI están separados de la búsqueda y el análisis, para reutilizar el mismo flujo sin duplicar las integraciones.
- **Uso controlado:** Redis comparte el presupuesto de consultas entre réplicas. Si no puede comprobarse el límite, se bloquean las consultas costosas.
- **Credenciales en el servidor:** las claves de los proveedores no se envían al navegador. Los modelos y el presupuesto de tokens están limitados por configuración.

## Resultado y evidencia

El proyecto ofrece búsqueda y preguntas sobre noticias tanto en web como en terminal. La demo enlazada permite explorar la interfaz; ejecutar consultas depende de la configuración y disponibilidad de los proveedores.

La documentación describe pruebas de contratos web, errores de fuentes y ambos proveedores de IA con credenciales ficticias. Esas pruebas no consumen saldo ni acreditan una prueba de carga o el funcionamiento con credenciales reales.

## Alcance actual

El análisis utiliza títulos y descripciones, no los artículos completos. El acceso mediante clave compartida está pensado para un servicio privado o un grupo de confianza; las cuentas individuales y la facturación quedan fuera del alcance actual.
