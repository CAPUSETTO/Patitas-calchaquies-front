import React from 'react';
import { Dog } from 'lucide-react';
import { Card, CardContent, EmptyState } from '../components/ui';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  entityName: string;
}

/**
 * PlaceholderPage - Vista provisional para módulos que se conectarán en la Fase 3.
 */
export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  entityName,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          {subtitle}
        </p>
      </div>

      <Card>
        <CardContent>
          <EmptyState
            icon={Dog}
            title={`Módulo de ${entityName} preparado`}
            description="La infraestructura de Layout, tokens y estilos ya está lista. En la Fase 3 conectaremos este módulo a los endpoints y DTOs de tu API en C#."
          />
        </CardContent>
      </Card>
    </div>
  );
};
