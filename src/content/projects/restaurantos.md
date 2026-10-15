---
title: RestaurantOS
description: Plataforma de autoservicio que conecta el menú y los pedidos con Cocina, Barra, stock y costeo de recetas. Un MVP para gestionar la operación del restaurante desde una misma aplicación.
category: Full stack · Gestión gastronómica
technologies: [React, TypeScript, Django REST, PostgreSQL, Supabase]
featured: true
order: 0
architecture: [React, Django REST, PostgreSQL]
---

## Del pedido a la operación

RestaurantOS conecta la experiencia del cliente con el trabajo del restaurante: explorar la carta, consultar ingredientes y alérgenos, armar un carrito y seguir la preparación de un pedido. Cocina y Barra reciben los tickets de su área y actualizan su estado.

## Mi trabajo

Desarrollo e integración del frontend y el backend, modelado de datos y diseño de los flujos del cliente y del personal. La interfaz utiliza una paleta charcoal, superficies de cristal y diseños adaptables a móvil y escritorio.

## Un laboratorio de costos

El módulo de Costeo reúne insumos, inventario de referencia, recetas versionadas y fichas técnicas. Incorpora históricos de precios, importación y exportación de datos, cálculo de costos por porción y simulación del precio de venta y margen teórico.

## Decisiones técnicas

- **Control de acceso:** sesiones de Django y permisos por rol para separar administración, Cocina y Barra.
- **Stock consistente:** reservas y operaciones transaccionales para coordinar disponibilidad y pedidos.
- **Protección frente a duplicados:** referencias idempotentes para recuperar intentos de compra.
- **Precisión de importes:** cálculos decimales en el backend y precios históricos de los pedidos.
- **Navegación ágil:** caché de catálogo y detalles, con actualización de disponibilidad.

## Arquitectura

React, TypeScript y Vite para la interfaz; Django REST Framework para las reglas de negocio y la API; PostgreSQL alojado en Supabase para la persistencia. Incluye un dashboard con indicadores del sistema.

## Estado del proyecto

MVP funcional de demostración, actualmente en pausa. La integración con Culqi está implementada, pero sigue pendiente la validación de extremo a extremo y la habilitación del proveedor. Los pagos de demostración y las métricas asociadas no representan cobros reales. No se presenta como un sistema en producción comercial.
