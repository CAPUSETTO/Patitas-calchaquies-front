import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Syringe,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  ErrorAlert,
  ConfirmModal,
} from '../components/ui';

/**
 * HomePage - Panel Operativo Principal del Refugio Patitas Calchaquíes.
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [animalName, setAnimalName] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD7]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Panel Operativo del Refugio
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Gestión conectada a tu API en C# (puerto 5227).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/personas')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Padrón de Personas
          </Button>
        </div>
      </div>

      {/* Directorio de Módulos Activos de la API */}
      <section aria-label="Estado de módulos del backend" className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden">
        <div className="px-5 py-4 bg-[#F3EFEA]/70 border-b border-[#E5DFD7] flex items-center justify-between">
          <h3 className="font-semibold text-base text-stone-900">
            Módulos Conectados con Controladores C#
          </h3>
          <span className="text-xs font-medium text-stone-600 tabular-data">
            Puerto 5227
          </span>
        </div>

        <div className="divide-y divide-[#E5DFD7]">
          {/* 1. Personas */}
          <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900 text-sm sm:text-base">
                    Padrón de Personas
                  </span>
                  <Badge variant="success" dot>
                    CRUD Completo
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Consume <code className="font-mono text-xs bg-[#F3EFEA] px-1.5 py-0.5 rounded">api/Personas</code> (Alta, Baja, Modificación, Detalle, búsqueda por DNI y nombre).
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/personas')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="self-end sm:self-center shrink-0"
            >
              Abrir
            </Button>
          </div>

          {/* 2. Vacunas */}
          <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900 text-sm sm:text-base">
                    Catálogo de Vacunas
                  </span>
                  <Badge variant="success" dot>
                    CRUD Completo
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Consume <code className="font-mono text-xs bg-[#F3EFEA] px-1.5 py-0.5 rounded">api/Vacuna</code> (Alta, Baja, Modificación y búsqueda por nombre).
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/vacunas')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="self-end sm:self-center shrink-0"
            >
              Abrir
            </Button>
          </div>

          {/* 3. Medicamentos */}
          <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900 text-sm sm:text-base">
                    Catálogo de Medicamentos
                  </span>
                  <Badge variant="success" dot>
                    CRUD Completo
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Consume <code className="font-mono text-xs bg-[#F3EFEA] px-1.5 py-0.5 rounded">api/Medicamento</code> (Alta, Baja, Modificación y búsqueda por nombre).
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/medicamentos')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="self-end sm:self-center shrink-0"
            >
              Abrir
            </Button>
          </div>

          {/* 4. Razas */}
          <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900 text-sm sm:text-base">
                    Catálogo de Razas
                  </span>
                  <Badge variant="success" dot>
                    Filtro por Especie y Alta
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Consume <code className="font-mono text-xs bg-[#F3EFEA] px-1.5 py-0.5 rounded">api/Raza</code> (Listado completo, filtrado por especie y registro de nuevas razas).
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/razas')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="self-end sm:self-center shrink-0"
            >
              Abrir
            </Button>
          </div>
        </div>
      </section>

      {/* Banco de Pruebas de Componentes UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Input y Reactividad (useState)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre de prueba"
              placeholder="Escribe para probar reactividad..."
              value={animalName}
              onChange={(e) => {
                setAnimalName(e.target.value);
                if (showError && e.target.value.trim().length > 0) {
                  setShowError(false);
                }
              }}
              error={showError ? 'Este campo no puede quedar vacío' : undefined}
              helperText={!showError ? 'Tamaño 16px en móvil para evitar zoom involuntario' : undefined}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!animalName.trim()) setShowError(true);
                }}
              >
                Validar Campo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnimalName('');
                  setShowError(false);
                }}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tokens Semánticos y Modal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>Disponible</Badge>
              <Badge variant="warning" dot>En Tratamiento</Badge>
              <Badge variant="danger" dot>Urgente</Badge>
              <Badge variant="info" dot>Adoptado</Badge>
              <Badge variant="neutral">Inactivo</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Probar Modal de Confirmación
              </Button>
            </div>

            <ErrorAlert
              title="Prueba de alerta de comunicación"
              message="Cuando la API devuelva un error de validación o la base de datos no esté accesible, se notificará aquí con opción de reintento."
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="¿Confirmar acción de prueba?"
        description="Este modal accesible bloquea el scroll de fondo y se cierra con la tecla Escape."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
