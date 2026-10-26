import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  CheckCircle2,
  Image as ImageIcon,
  FolderCheck,
} from 'lucide-react';
import { Button } from './Button';

export interface ImageFrameUploaderProps {
  value: string;
  suggestedName?: string;
  onChange: (savedRelativePath: string) => void;
}

const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 600; // Proporción 4:3 estándar para las tarjetas y fichas

export const ImageFrameUploader: React.FC<ImageFrameUploaderProps> = ({
  value,
  suggestedName = 'animal',
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Estado de la imagen local cargada para encuadrar
  const [hasLocalImage, setHasLocalImage] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  // Desplazamiento relativo (-1 a 1) respecto al margen disponible
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Estado de arrastre (drag / touch)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number }>({
    x: 0,
    y: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  // Estado de guardado en la carpeta raíz `/imagenes-animales`
  const [isSavingFile, setIsSavingFile] = useState<boolean>(false);
  const [savedPath, setSavedPath] = useState<string>(value || '');
  const [errorUpload, setErrorUpload] = useState<string | null>(null);

  useEffect(() => {
    setSavedPath(value || '');
  }, [value]);

  /**
   * Dibuja la imagen adaptada (cover), centrada y con el desplazamiento/zoom elegido por el usuario
   * en el canvas de 800x600.
   */
  const renderToCanvas = useCallback(
    (img: HTMLImageElement, currentZoom: number, curX: number, curY: number): string | null => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      ctx.fillStyle = '#EDF4F0';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // Escala base para cubrir (object-fit: cover) todo el lienzo de 800x600 y centrar
      const baseScale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
      const finalScale = baseScale * currentZoom;

      const drawWidth = img.width * finalScale;
      const drawHeight = img.height * finalScale;

      // Margen máximo de movimiento para que nunca queden bordes vacíos
      const maxOverflowX = Math.max(0, (drawWidth - TARGET_WIDTH) / 2);
      const maxOverflowY = Math.max(0, (drawHeight - TARGET_HEIGHT) / 2);

      const clampedX = Math.max(-1, Math.min(1, curX));
      const clampedY = Math.max(-1, Math.min(1, curY));

      const drawX = (TARGET_WIDTH - drawWidth) / 2 + clampedX * maxOverflowX;
      const drawY = (TARGET_HEIGHT - drawHeight) / 2 + clampedY * maxOverflowY;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      return canvas.toDataURL('image/jpeg', 0.88);
    },
    []
  );

  /**
   * Envía el resultado encuadrado al servidor local para guardarlo en `/imagenes-animales/`
   * en la raíz del proyecto y actualiza el formulario con la ruta relativa.
   */
  const guardarEnCarpetaRaiz = useCallback(
    async (dataUrl: string) => {
      setIsSavingFile(true);
      setErrorUpload(null);
      try {
        const cleanCode = suggestedName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, '-');
        const uniqueFileName = `${cleanCode || 'animal'}-${Date.now()}`;

        const response = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: uniqueFileName,
            dataUrl,
          }),
        });

        if (!response.ok) {
          throw new Error('No se pudo guardar la imagen en la carpeta raíz.');
        }

        const data = (await response.json()) as { ruta?: string; error?: string };
        if (data.ruta) {
          setSavedPath(data.ruta);
          onChange(data.ruta);
        } else {
          throw new Error(data.error || 'Respuesta inválida al guardar imagen.');
        }
      } catch (err) {
        setErrorUpload(
          err instanceof Error ? err.message : 'Error al guardar la foto en la carpeta raíz.'
        );
      } finally {
        setIsSavingFile(false);
      }
    },
    [onChange, suggestedName]
  );

  // Redibujar en tiempo real cada vez que cambia zoom u offset
  useEffect(() => {
    const img = loadedImageRef.current;
    if (!img || !hasLocalImage) return;
    renderToCanvas(img, zoom, offsetX, offsetY);
  }, [zoom, offsetX, offsetY, hasLocalImage, renderToCanvas]);

  // Guardar automáticamente en la carpeta raíz (con debounce de 350ms tras terminar de acomodar)
  useEffect(() => {
    const img = loadedImageRef.current;
    if (!img || !hasLocalImage || isDragging) return;

    const timer = window.setTimeout(() => {
      const dataUrl = renderToCanvas(img, zoom, offsetX, offsetY);
      if (dataUrl) {
        void guardarEnCarpetaRaiz(dataUrl);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [zoom, offsetX, offsetY, hasLocalImage, isDragging, renderToCanvas, guardarEnCarpetaRaiz]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorUpload(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        loadedImageRef.current = img;
        // Si la imagen ya tiene exactamente las mismas dimensiones que su contenedor (o muy distinto),
        // iniciamos con un leve margen de zoom (1.08) para que pueda acomodarse en cualquier dirección
        setZoom(1.05);
        setOffsetX(0);
        setOffsetY(0);
        setHasLocalImage(true);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasLocalImage) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !hasLocalImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const deltaX = (e.clientX - dragStartRef.current.x) / (rect.width * 0.45);
    const deltaY = (e.clientY - dragStartRef.current.y) / (rect.height * 0.45);

    setOffsetX(Math.max(-1, Math.min(1, dragStartRef.current.startOffsetX + deltaX)));
    setOffsetY(Math.max(-1, Math.min(1, dragStartRef.current.startOffsetY + deltaY)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handleCentrar = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-bold text-[#0F291E] tracking-tight">
          Fotografía del Animal
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<Upload className="w-4 h-4 text-[#16A34A]" />}
        >
          {hasLocalImage || savedPath ? 'Cambiar foto local' : 'Seleccionar foto local'}
        </Button>
      </div>

      {/* Visor de encuadre interactivo (4:3) */}
      <div className="rounded-2xl border border-[#B8CCC0] bg-[#F7FAF8] overflow-hidden">
        {hasLocalImage ? (
          <div className="space-y-3 p-3 sm:p-4">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative w-full aspect-4/3 max-h-72 mx-auto rounded-xl overflow-hidden bg-[#0F291E] select-none touch-none border border-[#DCE6DF] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <canvas
                ref={previewCanvasRef}
                width={TARGET_WIDTH}
                height={TARGET_HEIGHT}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Guías sutiles de encuadre mientras se arrastra */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 transition-opacity duration-150 ${
                  isDragging ? 'opacity-60' : 'opacity-0'
                }`}
              >
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-white/40" />
                <div className="border-r border-white/40" />
                <div />
              </div>

              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F291E]/80 backdrop-blur-xs text-white text-xs font-bold">
                  <Move className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Arrastra la foto para acomodarla</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#0F291E]/80 text-[#A7F3D0] font-mono text-[11px] font-bold">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            {/* Controles de Zoom y Centrado Automático */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-white border border-[#B8CCC0] text-[#0F291E] hover:bg-[#EDF4F0] cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={2.6}
                  step={0.02}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  aria-label="Ajustar zoom de la fotografía"
                  className="flex-1 accent-[#16A34A] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.6, Number((z + 0.1).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-white border border-[#B8CCC0] text-[#0F291E] hover:bg-[#EDF4F0] cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleCentrar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#EDF4F0] border border-[#B8CCC0] text-xs font-bold text-[#0F291E] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Centrar y adaptar</span>
              </button>
            </div>
          </div>
        ) : savedPath ? (
          <div className="p-3 sm:p-4 space-y-2.5">
            <div className="relative w-full aspect-4/3 max-h-64 mx-auto rounded-xl overflow-hidden bg-[#EDF4F0] border border-[#DCE6DF]">
              <img
                src={savedPath}
                alt="Vista previa actual"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <p className="text-xs text-[#2D4A3E] text-center">
              Haz clic en <strong>«Cambiar foto local»</strong> arriba si deseas seleccionar otra
              imagen y acomodar su encuadre.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-10 px-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#EDF4F0]/70 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCE6DF] text-[#16A34A] flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-sm font-bold text-[#0F291E]">
                Toca aquí para elegir una foto desde tu PC o celular
              </span>
              <span className="block text-xs text-[#527062]">
                Se adaptará automáticamente al formato de ficha y podrás moverla o hacer zoom
              </span>
            </div>
          </button>
        )}

        {/* Barra inferior con la ruta guardada en la carpeta raíz */}
        {(savedPath || isSavingFile || errorUpload) && (
          <div className="px-4 py-2.5 bg-white border-t border-[#DCE6DF] flex items-center justify-between gap-2 text-xs">
            {errorUpload ? (
              <span className="font-bold text-[#DC2626]">{errorUpload}</span>
            ) : isSavingFile ? (
              <span className="font-medium text-[#2D4A3E]">
                Guardando encuadre en carpeta raíz `/imagenes-animales`...
              </span>
            ) : (
              <div className="flex items-center gap-2 min-w-0 text-[#14532D]">
                <FolderCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-bold shrink-0">Ruta en BD:</span>
                <code className="font-mono text-[#0F291E] bg-[#F0FDF4] px-2 py-0.5 rounded truncate">
                  {savedPath}
                </code>
              </div>
            )}
            {savedPath && !isSavingFile && !errorUpload && (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
