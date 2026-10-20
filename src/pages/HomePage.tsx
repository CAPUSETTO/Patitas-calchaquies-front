import React, { useState } from 'react';
import { 
  Dog, 
  HeartHandshake, 
  Stethoscope, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles,
  Layers,
  Smartphone
} from 'lucide-react';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  Skeleton, 
  ErrorAlert, 
  ConfirmModal 
} from '../components/ui';

/**
 * HomePage - Pantalla de inicio operativo y laboratorio de verificación de Fase 1.
 * 
 * TUTORÍA PARA DESARROLLADORES C#:
 * 1. ¿Qué es `useState`?
 *    En C#, si cambias el valor de un campo privado `private int _contador;`, la interfaz no se entera
 *    a menos que uses eventos, INotifyPropertyChanged o recargues la vista.
 *    En React, `const [estado, setEstado] = useState(valorInicial);` nos da:
 *    - `estado`: El valor actual para leer.
 *    - `setEstado`: La función que usamos para modificarlo. Cuando la llamas, React detecta el cambio
 *      y vuelve a ejecutar esta función (re-render) para pintar el nuevo HTML de forma reactiva.
 */
export const HomePage: React.FC = () => {
  // Estados para probar la interactividad de los componentes UI base
  const [animalName, setAnimalName] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState<boolean>(false);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Simulación de acción asíncrona (como llamar a un endpoint de la API)
  const handleSimulateApiCall = () => {
    setIsSimulatingLoad(true);
    setTimeout(() => {
      setIsSimulatingLoad(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Cabecera de Bienvenida y Propósito */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DFD7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B84A27]">
              Panel Operativo
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-600">
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              Modo Móvil Android Activo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
            Refugio Patitas Calchaquíes
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Fundamentos visuales, layout móvil para Android y componentes UI base (Fase 1 completada).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkeleton((prev) => !prev)}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            {showSkeleton ? 'Ver Datos' : 'Ver Skeletons'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSimulateApiCall}
            isLoading={isSimulatingLoad}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Simular Guardado
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen Rápido (Métricas de Operación en el Refugio) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {showSkeleton ? (
          <>
            <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-[#B84A27] flex items-center justify-center shrink-0">
                  <Dog className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-600">Animales Resguardados</p>
                  <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">24</p>
                  <div className="mt-1">
                    <Badge variant="success" dot>18 listos para adopción</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-600">En Tratamiento Veterinario</p>
                  <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">6</p>
                  <div className="mt-1">
                    <Badge variant="warning" dot>2 controles pendientes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-600">Adopciones este Mes</p>
                  <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">9</p>
                  <div className="mt-1">
                    <Badge variant="info" dot>4 seguimientos activos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 3. Laboratorio de Verificación de Componentes UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario y Pruebas de Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B84A27]" />
              Formulario Accesible (Input + useId + 16px)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm text-stone-600">
              Prueba escribir en el campo. El tamaño de letra a 16px evita que Chrome en Android aplique zoom forzado.
            </p>

            <Input
              label="Nombre del Animal rescatado"
              placeholder="Ej: Manchitas, Toby, Canela..."
              value={animalName}
              onChange={(e) => {
                setAnimalName(e.target.value);
                if (showError && e.target.value.trim().length > 0) {
                  setShowError(false);
                }
              }}
              error={showError ? 'El nombre del animal es obligatorio' : undefined}
              helperText={!showError ? 'Escribe el nombre registrado al ingresar al refugio' : undefined}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E5DFD7] text-xs space-y-1">
              <span className="font-semibold text-stone-700 block">Estado reactivo en memoria:</span>
              <span className="text-stone-900 font-mono">
                {animalName ? `"${animalName}"` : '(campo vacío)'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!animalName.trim()) {
                    setShowError(true);
                  } else {
                    alert(`¡Validación correcta para: ${animalName}!`);
                  }
                }}
              >
                Validar Entrada
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnimalName('');
                  setShowError(false);
                }}
              >
                Limpiar Campo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Variantes de Botones y Estados Semánticos */}
        <Card>
          <CardHeader>
            <CardTitle>Tokens de Color y Estados Semánticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Etiquetas de Estado (Badges de Alto Contraste)
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" dot>Disponible</Badge>
                <Badge variant="warning" dot>En Tratamiento</Badge>
                <Badge variant="danger" dot>Urgente</Badge>
                <Badge variant="info" dot>Adoptado</Badge>
                <Badge variant="neutral">Histórico</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Variantes de Botones Táctiles (mínimo 44px de alto)
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary" size="sm">Primario</Button>
                <Button variant="secondary" size="sm">Secundario</Button>
                <Button variant="outline" size="sm">Contorno</Button>
                <Button variant="ghost" size="sm">Fantasma</Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Abrir Modal
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <ErrorAlert
                title="Prueba de Resiliencia ante la Red"
                message="Este componente se utilizará en la Fase 2 y 3 para mostrar advertencias claras si falla la conexión con tu API local."
                onRetry={() => alert('¡Reintento de conexión simulado con éxito!')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="¿Confirmar acción destructiva?"
        description="Este modal accesible bloquea el scroll de la página de fondo y puede cerrarse tocando fuera, con el botón Cancelar o presionando la tecla Escape en el teclado."
        confirmLabel="Sí, eliminar registro"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          setIsModalOpen(false);
          alert('Acción confirmada');
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
