# Design System — Tierra y Pizarra Calchaquí

<!-- impeccable:design-schema 1 -->

## 1. Fundamentos Visuales (Modo: Operate)
El sistema de diseño está concebido para uso operativo continuo, priorizando escaneabilidad rápida en exteriores bajo la luz del sol en dispositivos móviles Android y ergonomía de escritorio.

## 2. Paleta de Colores (Estrategia Restrained)
- **Superficie Principal (Ground):** `#FAF8F5` (Piedra/Arena clara, cálida, sin fatiga visual ni deslumbramiento).
- **Superficie Secundaria (Panels / Chrome):** `#F3EFEA` (Piedra suave para Sidebar y BottomNav).
- **Superficie de Tarjeta / Contenedor:** `#FFFFFF` con borde sutil `#E5DFD7`. Cero sombras difusas pesadas.
- **Texto Principal (High Contrast):** `#1C1917` (Pizarra oscuro, ratio de contraste > 14:1 contra el fondo).
- **Texto Secundario (Muted):** `#57534E` (Pizarra medio, ratio de contraste > 5:1).
- **Acento Primario (Brand Action):** `#B84A27` (Terracota Calchaquí, contraste accesible AA con texto blanco).
- **Acento Primario Hover/Active:** `#9C3B1E` / `#7E2F17`.

### Vocabulario Semántico de Estados
- **Disponible / Éxito:** `#15803D` sobre fondo `#DCFCE7` (Borde `#BBF7D0`).
- **En Tratamiento / Advertencia:** `#B45309` sobre fondo `#FEF3C7` (Borde `#FDE68A`).
- **Urgente / Crítico / Error:** `#B91C1C` sobre fondo `#FEE2E2` (Borde `#FECACA`).
- **Adoptado / Tránsito / Info:** `#1D4ED8` sobre fondo `#DBEAFE` (Borde `#BFDBFE`).
- **Inactivo / Neutral:** `#57534E` sobre fondo `#F5F5F4` (Borde `#E7E5E4`).

## 3. Tipografía
- **Familia única:** System UI stack sans-serif (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Escala fija en rem:**
  - `text-xs`: 0.75rem (12px) - Metadatos secundarios
  - `text-sm`: 0.875rem (14px) - Badges, hints
  - `text-base`: 1rem (16px) - Cuerpo, inputs obligatorios en Android (evita auto-zoom)
  - `text-lg`: 1.125rem (18px) - Subtítulos, cabeceras de tarjeta
  - `text-xl`: 1.25rem (20px) - Títulos de sección
  - `text-2xl`: 1.5rem (24px) - Títulos de página

## 4. Ergonomía Táctil y Android
- Área táctil mínima: `44px x 44px` (`min-h-11`, `min-w-11`).
- `safe-area-inset-bottom` aplicado en navegación inferior.
- Sin dependencias exclusivas de `:hover` para interacción.
- Manejo de desbordamiento de texto: `truncate`, `line-clamp-2` y `min-w-0` en Flexbox/Grid.
