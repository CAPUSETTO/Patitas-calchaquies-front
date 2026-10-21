import React from 'react';
import { Home, Users, Syringe, Stethoscope, Sparkles } from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    name: 'Inicio',
    path: '/',
    icon: Home,
    description: 'Resumen operativo del refugio',
  },
  {
    name: 'Personas',
    path: '/personas',
    icon: Users,
    description: 'Adoptantes, voluntarios y contactos (api/Personas)',
  },
  {
    name: 'Vacunas',
    path: '/vacunas',
    icon: Syringe,
    description: 'Catálogo de vacunas (api/Vacuna)',
  },
  {
    name: 'Medicamentos',
    path: '/medicamentos',
    icon: Stethoscope,
    description: 'Catálogo de medicamentos (api/Medicamento)',
  },
  {
    name: 'Razas',
    path: '/razas',
    icon: Sparkles,
    description: 'Catálogo de razas por especie (api/Raza)',
  },
];
