# DESIGN.md — Sistema de Diseño: Patitas Calchaquíes

## 1. Identidad Visual y Dirección ("Fichero Clínico de Pestañas Escalonadas y Contadores de Chasis")
**Patitas Calchaquíes** es una plataforma web y móvil (Android-first) para el rescate, rehabilitación veterinaria y adopción responsable en los Valles Calchaquíes (Ruta 40, Salta / Tucumán / Catamarca).

Tras descartar la estética genérica de tarjetas blancas redondeadas y tipografías serif incómodas de leer (`Fraunces`), el sistema adopta una arquitectura inspirada en **planillas clínicas veterinarias de guardia y tableros físicos de sectores (`seed:3aa6152dd11177c9`)**:
- **Lectura sin esfuerzo al sol (`Atkinson Hyperlegible`):** Cuerpo de texto diseñado por el *Braille Institute* para máxima distinción de caracteres y lectura rápida tanto en escritorio como en celulares Android al aire libre.
- **Trazos estructurales firmes (`2px solid #1C1917`):** Bloques continuos subdivididos por líneas expuestas (`divide-x-2`, `divide-y-2`), sin tarjetas flotantes anidadas ni sombras difusas.
- **Chasis de contadores (`.counter-chassis` + `.counter-tube`):** Cabeceras operativas en pizarra oscura (`#1C1917`) con indicadores numéricos tubulares en `Chivo Mono` (`tabular-nums`).
- **Riel de pestañas escalonadas (`.tab-snap`):** Pestañas físicas que sobresalen del borde superior de cada fichero con respuesta mecánica instantánea (`90ms steps(2)`).

---

## 2. Paleta de Colores (Mantenida y Enfocada en Alto Contraste)

| Token / Uso | Hex | Aplicación en la Interfaz |
| :--- | :--- | :--- |
| **Papel Técnico de Campo** | `#FAF8F5` | Fondo principal cálido con cuadrícula técnica sutil (`.bg-field-grid`). |
| **Arena Calchaquí** | `#F2ECE1` | Cabeceras de planilla, pestañas inactivas y celdas destacadas. |
| **Chasis Pizarra (Tinta / Marco)** | `#1C1917` | Bordes estructurales de `2px`, chasis superior de contadores y texto primario. |
| **Terracota Calchaquí (Primario)** | `#B84A27` | Botones primarios, pestañas activas, perforaciones seleccionadas y alertas de acción. |
| **Verde Cardón (Sanidad / Alta)** | `#2D6A4F` | Estados de alta médica, animales listos para adopción y conexión activa con MySQL. |
| **Ámbar de Guardia** | `#F4A261` / `#9A3412` | Seguimiento nutricional, rehabilitación en curso y avisos preventivos. |

---

## 3. Tipografía de Alta Legibilidad

1. **Cuerpo y Lectura Clínica (`--font-sans: 'Atkinson Hyperlegible'`):**
   - Creada específicamente para maximizar la legibilidad en formularios, historias clínicas, temperamentos y tablas.
2. **Titulares y Pestañas de Sector (`--font-display: 'Archivo'`):**
   - Grotesca técnica firme en pesos `700–900` para encabezados de expediente, botones táctiles y pestañas de navegación.
3. **Contadores y Códigos Oficiales (`--font-mono: 'Chivo Mono'`):**
   - Números tabulares (`font-variant-numeric: tabular-nums`) para códigos (`CAN-2026-001`), matrículas (`MP-SAL-0418`), DNIs, raciones en gramos y fechas.

---

## 4. Arquitectura de Superficies

- **Portada Pública (`/` — [`src/pages/LandingPage.tsx`](file:///c:/Users/sebaz/Documents/front%20app%20Patitas%20calchaquies/src/pages/LandingPage.tsx)):**
  - **Chasis Superior Pizarra (`#1C1917`):** Identidad del puesto + banco de 3 contadores en vivo (`EN GUARDIA`, `APTOS ADOPCIÓN`, `REHABILITACIÓN`).
  - **Riel de Pestañas Escalonadas:** Filtra instantáneamente el censo por especie o por sector físico (`Caniles Norte`, `Gaterío Sol`, `Enfermería`).
  - **Fichero de Doble Hoja (5:7):** Índice de expedientes con perforación de selección a la izquierda (`5 cols`) y **Hoja Clínica Perforada** a la derecha (`7 cols`) con cuadrícula técnica de 4 celdas (`Ingreso_Animal.cs`, `Alojamiento_Animal.cs`, `PlanAlimentacion.cs`, `Esterilizacion.cs`) y **Planilla Oficial #02** de postulación.
- **Credencial de Guardia (`/login` — [`src/pages/LoginPage.tsx`](file:///c:/Users/sebaz/Documents/front%20app%20Patitas%20calchaquies/src/pages/LoginPage.tsx)):**
  - Tablero partido `7:5` con bordes de `2px solid #1C1917` y acceso en 1 toque para los 3 roles configurados (`Coordinación`, `Veterinaria`, `Voluntariado`).
- **Tablero Administrativo (`/admin` — [`src/pages/HomePage.tsx`](file:///c:/Users/sebaz/Documents/front%20app%20Patitas%20calchaquies/src/pages/HomePage.tsx)):**
  - Chasis de 4 contadores operativos, bandeja de evaluación de postulaciones web, ocupación por sector y directorio de módulos conectados con la API C#.
