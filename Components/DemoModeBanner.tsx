
import React from 'react';

const DemoModeBanner: React.FC = () => (
  <div className="bg-yellow-100 border-b-2 border-yellow-300 text-yellow-800 text-sm text-center p-2 sticky top-0 z-50">
    <p>
      <strong>Modo Demostración:</strong> El guardado en la nube y la generación con IA están desactivados. Tus cambios no se guardarán.
    </p>
  </div>
);

export default DemoModeBanner;
