# DESIGN.md — Sistema de Diseño: Asociación Protectora de Animales Patitas Calchaquíes

## 1. Identidad Visual y Emblema Oficial (`/logo-patitas.jpg`)
El sistema visual parte del **emblema oficial de la Asociación Protectora de Animales** (el mapa de Tucumán / Valles Calchaquíes en verde vivo con el perro y el gato abrazados en trazo verde bosque profundo, rodeados por el arco tipográfico rojo y las dos huellas verdes).

Toda la interfaz —tanto la **Landing Pública con efectos de scroll (`/`)** como el **Dashboard Operativo de Trabajadores (`/admin`)**— utiliza los colores exactos del emblema para que el logo se integre de forma orgánica y nunca desentone:
- **Cabeceras de Navegación en Blanco Puro (`#FFFFFF`):** permiten que el logo oficial (`/logo-patitas.jpg`) se funda directamente con la barra superior mediante `mix-blend-mode: multiply` sin bordes artificiales.
- **Secciones Inmersivas en Bosque Profundo (`#0F291E`):** replican el verde oscuro del trazo del perro, el gato y el contorno del mapa, presentando el logo dentro de un sello institucional blanco limpio.

---

## 2. Paleta Oficial Armonizada con el Logo

| Token / Rol | Hex | Origen en el Logo Oficial y Aplicación |
| :--- | :--- | :--- |
| **Bosque Profundo (Tinta / Hero / Sidebar)** | `#0F291E` / `#143325` | Extraído del contorno del mapa y del dibujo del perro y el gato. Usado en titulares, Hero, Sidebar y texto principal. |
| **Verde Valles / Hoja Viva (Primario)** | `#16A34A` / `#4DB83B` | Extraído del relleno del mapa y de las dos huellas laterales. Usado en botones primarios, filtros activos y estados de alta sanitaria. |
| **Rojo Protectora (Acción / Adopción)** | `#DC2626` / `#B91C1C` | Extraído del arco `"ASOCIACION PROTECTORA DE ANIMALES"`. Usado en llamados a la acción de adopción, marcadores de rescate y alertas. |
| **Blanco Salvia & Blanco Puro (Lienzo)** | `#F7FAF8` / `#FFFFFF` | Lienzo luminoso de alto contraste para lectura prolongada en el Dashboard y fusión limpia del emblema. |
| **Bordes Salvia** | `#DCE6DF` / `#B8CCC0` | Líneas divisorias limpias (`divide-x`, `divide-y`) sin tarjetas anidadas. |

---

## 3. Tipografía de Alta Legibilidad

1. **Cuerpo y Lectura Operativa (`--font-sans: 'Atkinson Hyperlegible'`):**
   - Creada por el *Braille Institute* para máxima distinción de caracteres y lectura rápida sin fatiga visual.
2. **Titulares y Botones (`--font-display: 'Archivo'`):**
   - Grotesca moderna y firme (`600–900`) que acompaña el peso visual del arco del logo.
3. **Datos Tabulares y Códigos (`--font-mono: 'Chivo Mono'`):**
   - Números tabulares (`font-variant-numeric: tabular-nums`) para códigos (`CAN-2026-001`), matrículas (`MP-SAL-0418`), DNIs y raciones en gramos.
