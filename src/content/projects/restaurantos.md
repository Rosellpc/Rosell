---
title: RestaurantOS
description: Plataforma de autoservicio que conecta el menú y los pedidos con Cocina, Barra, stock y costeo de recetas. Un MVP para gestionar la operación del restaurante desde una misma aplicación.
category: Full stack · Gestión gastronómica
technologies: [React, TypeScript, Django REST, PostgreSQL, Supabase]
featured: true
order: 0
architecture: [React, Django REST, PostgreSQL]
preview: /projects/restaurantos-costing.png
previewAlt: Panel de Costeo de RestaurantOS con insumos, recetas, costos y categorías
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

RestaurantOS funciona actualmente en un entorno local, con una orientación de despliegue **on-premise**: ejecutar la aplicación en la infraestructura del restaurante y acceder a sus módulos desde la red del establecimiento.

La configuración de desarrollo actual utiliza PostgreSQL alojado en Supabase. El despliegue con la base de datos también instalada en el local forma parte de la evolución prevista; no se presenta todavía como una solución completamente autónoma ni sin conexión.

El siguiente horizonte es su lanzamiento como **SaaS**, para ofrecer la plataforma como un servicio alojado y permitir que distintos restaurantes accedan a ella. Esta modalidad está prevista, aún no disponible comercialmente.

La integración de pagos con Culqi está implementada y pendiente de validación de extremo a extremo con el proveedor. Mientras tanto, el flujo de compra se presenta en modalidad de demostración.
