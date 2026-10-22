import React from 'react';
import {
  Home,
  Dog,
  HeartHandshake,
  Stethoscope,
  Users,
  Syringe,
  Pill,
  Sparkles,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  seccion?: 'principal' | 'catalogo';
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  // 1. Módulos Principales del Panel Administrativo
  {
    name: 'Panel',
    path: '/admin',
    icon: Home,
    description: 'Panel operativo general',
    seccion: 'principal',
  },
  {
    name: 'Animales',
    path: '/admin/animales',
    icon: Dog,
    description: 'Censo, fichas de rescate y estados',
    seccion: 'principal',
  },
  {
    name: 'Adopciones',
    path: '/admin/adopciones',
    icon: HeartHandshake,
    description: 'Solicitudes y seguimiento',
    seccion: 'principal',
  },
  {
    name: 'Atenciones',
    path: '/admin/atenciones',
    icon: Stethoscope,
    description: 'Consultas y tratamientos',
    seccion: 'principal',
  },
  {
    name: 'Personas',
    path: '/admin/personas',
    icon: Users,
    description: 'Padrón de adoptantes y contactos (api/Personas)',
    seccion: 'principal',
  },

  // 2. Catálogos Operativos
  {
    name: 'Vacunas',
    path: '/admin/vacunas',
    icon: Syringe,
    description: 'Catálogo de inmunización (api/Vacuna)',
    seccion: 'catalogo',
  },
  {
    name: 'Medicamentos',
    path: '/admin/medicamentos',
    icon: Pill,
    description: 'Catálogo de fármacos (api/Medicamento)',
    seccion: 'catalogo',
  },
  {
    name: 'Razas',
    path: '/admin/razas',
    icon: Sparkles,
    description: 'Razas por especie (api/Raza)',
    seccion: 'catalogo',
  },
];

// Ítems fijados en la barra táctil inferior de Android (5 accesos de alcance con el pulgar)
export const BOTTOM_NAV_ITEMS = MAIN_NAV_ITEMS.filter((i) => i.seccion === 'principal');
