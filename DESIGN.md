# DESIGN.md — Sistema de Diseño: Patitas Calchaquíes

## 1. Identidad Visual y Dirección ("Hilo de Ruta 40 & Capas Vibrantes")
**Patitas Calchaquíes** separa claramente la experiencia según el modo de uso:
- **Landing Pública (`/` — Modo *Persuade*):** Diseño moderno impulsado por scroll (*Scrollytelling & Layered Cards*, `risograph-web-system` + `exhibition-museum-curation-provenance-ribbon`, `seed:3aa6152dd11177c9`). Un **Hilo de Custodia** interactivo se va trazando en tiempo real a medida que el visitante baja por la página, conectando las 3 estaciones reales del refugio (Rescate en Ruta 40 &rarr; Rehabilitación y Alta Clínica &rarr; Solicitud de Adopción), con paralaje suave en el Hero y desplazamiento de capas cromáticas (`.riso-frame`, `.surface-layered`, `.scroll-reveal`).
- **Dashboard de Trabajadores (`/admin` y `/login` — Modo *Operate*):** Superficie operativa de alto rendimiento sobre **Blanco Titanio (`#F8FAFC`)** y **Pizarra Nocturna (`#0F172A`)**, optimizada para que el personal de guardia, veterinarios y voluntarios trabajen durante horas sin fatiga visual ni distracciones decorativas, tanto en escritorio como en teléfonos Android.

---

## 2. Paleta de Colores Moderna

| Token / Rol | Hex | Aplicación en la Interfaz |
| :--- | :--- | :--- |
| **Blanco Titanio (Canvas)** | `#F8FAFC` | Fondo principal limpio con patrón sutil de puntos (`.bg-modern-dots`) y área de trabajo del Dashboard. |
| **Pizarra Nocturna (Contraste / Nav)** | `#0F172A` | Hero inmersivo de la Landing, barra superior flotante y Sidebar del Dashboard de trabajadores. |
| **Cobalto Eléctrico (Capa 1 / Primaria)** | `#2563EB` | Navegación activa, filtros seleccionados, códigos de identificación y enlaces técnicos. |
| **Coral Solar (Capa 2 / Adopción)** | `#F97316` | Botones primarios de adopción, barra de progreso de scroll y marcadores geográficos de la Ruta 40. |
| **Esmeralda Andino (Capa 3 / Sanidad)** | `#059669` | Estados de alta médica, animales listos para adoptar y conexión activa con MySQL. |
| **Bordes y Divisores** | `#E2E8F0` / `#CBD5E1` | Líneas divisorias limpias (`divide-x`, `divide-y`) sin tarjetas anidadas. |

---

## 3. Tipografía de Alta Legibilidad

1. **Cuerpo y Lectura Operativa (`--font-sans: 'Atkinson Hyperlegible'`):**
   - Creada por el *Braille Institute* para máxima distinción de caracteres y lectura rápida en formularios, historias clínicas y tablas.
2. **Titulares y Botones (`--font-display: 'Archivo'`):**
   - Grotesca moderna y contundente (`600–900`) para encabezados, estaciones de scroll y pestañas de filtro.
3. **Datos Tabulares y Códigos (`--font-mono: 'Chivo Mono'`):**
   - Números tabulares (`font-variant-numeric: tabular-nums`) para códigos (`CAN-2026-001`), matrículas (`MP-SAL-0418`), DNIs, raciones en gramos y fechas.

---

## 4. Efectos de Scroll e Interacción en la Landing (`src/pages/LandingPage.tsx`)

1. **Barra y Línea Vertical del Hilo de Custodia (`scrollProgress`):**
   - Al hacer scroll, tanto la barra superior como el riel vertical a la izquierda del catálogo se iluminan progresivamente desde Cobalto (`#2563EB`) pasando por Coral (`#F97316`) hasta Esmeralda (`#059669`), reflejando el recorrido por las 3 estaciones.
2. **Paralaje Suave y Marco de Capas Riso (`.riso-frame`):**
   - En la apertura nocturna (`#0F172A`), el escaparate del animal destacado desplaza suavemente sus capas posteriores Cobalto y Coral en scroll y en hover.
3. **Revelación Progresiva en Cascada (`.scroll-reveal`):**
   - Activada mediante `IntersectionObserver` con curva `cubic-bezier(0.22, 1, 0.36, 1)` y soporte nativo para `prefers-reduced-motion`.
4. **Visor Clínico Sticky + Cuadrícula Continua C#:**
   - Mientras recorres la lista de rescatados a la izquierda, el expediente detallado permanece anclado (*sticky*) a la derecha mostrando las 4 entidades del dominio (`Ingreso_Animal.cs`, `Alojamiento_Animal.cs`, `PlanAlimentacion.cs`, `Esterilizacion.cs`) y conectando en 1 clic con la Estación Final de adopción (`SolicitudAdopcion.cs`).
