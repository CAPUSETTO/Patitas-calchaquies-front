# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vite + React + TypeScript + Tailwind CSS + Axios + React Router DOM + Lucide React

## Users
Personal y voluntarios del refugio de animales "Patitas Calchaquíes". Utilizan la aplicación principalmente desde teléfonos móviles Android en exteriores (patios, caniles, bajo luz solar) y desde computadoras de escritorio en el área administrativa.

## Product Purpose
Gestionar de manera integral el ingreso, estado de salud, seguimiento, adopciones y fichas de los animales rescatados por el refugio, agilizando las tareas diarias y eliminando registros en papel.

## Positioning
Sistema operativo de gestión ágil para refugios comunitarios de la región Calchaquí, optimizado para uso táctil en terreno con alta legibilidad bajo el sol y arquitectura espejo de la API backend en C#.

## Operating Context
- Uso en exteriores y en movimiento (Android): luz ambiental fuerte, manipulación con una sola mano, necesidad de áreas de toque grandes (≥ 44px) y contraste elevado.
- Uso administrativo en escritorio: vistas panorámicas con paneles y atajos de teclado.
- Conectividad en red local (Wi-Fi) conectando directamente al servidor de la API en C#.

## Capabilities and Constraints
- Operaciones CRUD completas sobre las entidades del refugio.
- Conexión vía HTTP a backend C# (.NET) con rutas custom en red local.
- Dos superficies diferenciadas bajo la skill `impeccable`:
  1. **Web Pública (`/` — Modo `Persuade`):** Portada comunitaria con bitácora interactiva de animales en adopción y formulario público de postulación (`SolicitudAdopcion`).
  2. **Login (`/login`) y Dashboard Administrativo (`/admin/*` — Modo `Operate`):** Autenticación vinculada a `Usuario.cs` y `Rol.cs` con rutas protegidas (`ProtectedRoute`) y los 8 módulos operativos del refugio.
- Cero uso de `any` en TypeScript, interfaces estrictas reflejando los DTOs de C#.
- Mobile-first con Bottom Navigation para Android y Sidebar para escritorio.

## Brand Commitments
- Nombre: **Patitas Calchaquíes**
- Tono visual: Cálido, sobrio, funcional y orgánico ("Tierra y Pizarra Calchaquí"). Sin elementos decorativos artificiales ni sombras pesadas.

## Evidence on Hand
- Arquitectura de backend en 3 capas (.NET: Infraestructura, Core, API).
- Configuración para red local en puerto 5173 (`server: { host: true, port: 5173 }`).

## Product Principles
1. **Claridad sobre adorno:** La interfaz debe ser una herramienta de trabajo inmediata; cada color y espaciado tiene una función semántica.
2. **Ergonomía táctil implacable:** Toda acción crítica debe ser alcanzable con el pulgar en Android sin riesgo de pulsaciones erróneas.
3. **Resiliencia ante la red:** Manejo exhaustivo de estados de carga, fallos de conexión a la API local y listas vacías.
4. **Mapeo directo N-Capas:** Separación limpia entre Tipos (DTOs), Servicios (Axios), Componentes Reutilizables y Páginas.
