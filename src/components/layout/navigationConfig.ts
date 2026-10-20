import React from 'react';
import { Home, Dog, HeartHandshake, Stethoscope } from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    name: 'Inicio',
    path: '/',
    icon: Home,
    description: 'Resumen operativo del refugio',
  },
  {
    name: 'Animales',
    path: '/animales',
    icon: Dog,
    description: 'Censo y fichas de rescate',
  },
  {
    name: 'Adopciones',
    path: '/adopciones',
    icon: HeartHandshake,
    description: 'Postulantes y adopciones',
  },
  {
    name: 'Atenciones',
    path: '/atenciones',
    icon: Stethoscope,
    description: 'Controles veterinarios y vacunas',
  },
];
