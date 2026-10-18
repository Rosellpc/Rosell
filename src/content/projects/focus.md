---
title: Focus
description: Hábitos, temporizador y reportes en Windows y Android, con datos locales y uso diario sin conexión.
category: Aplicación multiplataforma · Productividad
technologies: [React, TypeScript, Tauri, Rust, SQLite]
featured: false
contribution: Interfaz e integración con Tauri, Rust y SQLite
status: Aplicación con instaladores para Windows y Android
order: 1
preview: /projects/focus.png
previewAlt: Interfaz de Focus para gestionar hábitos y consultar el progreso
repository: https://github.com/Rosellpc/Focus
demo: https://github.com/Rosellpc/Focus/releases
demoLabel: Ver descargas
---

## El problema

Registrar hábitos y tiempo sin depender de una cuenta ni de una conexión. El reto también está en conservar un historial coherente cuando cambian las metas, se archiva un hábito o se interrumpe una sesión.

## Mi aporte

Desarrollo de la interfaz con React y TypeScript y de su integración con Tauri, Rust y SQLite. El trabajo abarca el registro diario, el temporizador, los reportes y los flujos de respaldo y restauración.

## Decisiones técnicas

- **Datos locales:** SQLite mantiene los registros en cada dispositivo. Las metas conservan su historial para que una edición no cambie los períodos anteriores.
- **Cambios seguros:** migraciones y restauraciones transaccionales; si una restauración falla, se conserva la base anterior. La interfaz confirma el guardado antes de actualizar el contador.
- **Continuidad del temporizador:** la sesión conserva sus fechas de inicio y finalización para recuperarse tras cerrar o suspender el equipo.

## Resultado y evidencia

La documentación del proyecto recoge instaladores para Windows x64 y Android ARM64, junto con firmas y checksums de las versiones publicadas. El código y las descargas están enlazados al final de esta página.

También documenta pruebas con SQLite real para migraciones, guardados simultáneos, restauración y persistencia al reabrir. Las pruebas de interfaz simulan los comandos Tauri; no equivalen a validar la aplicación instalada en ambos sistemas.

## Alcance actual

Cada dispositivo mantiene sus propios datos, sin sincronización automática. En Android, el sonido del temporizador requiere que la aplicación siga ejecutándose; no funciona como alarma garantizada con la app cerrada.
