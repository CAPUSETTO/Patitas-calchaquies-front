import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Punto de entrada principal (Entry Point).
 * Equivalente a `Program.cs` en una aplicación C# .NET.
 * Localiza el elemento `<div id="root"></div>` en `index.html` y monta el árbol de componentes de React.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz con id "root" en el documento HTML');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
