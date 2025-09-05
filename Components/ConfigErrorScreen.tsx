
import React from 'react';

const ConfigErrorScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md border border-red-200">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Error de Configuración</h1>
        <p className="text-gray-700 mb-4">
          La aplicación no ha podido inicializarse correctamente. Esto suele ocurrir porque las claves de API para los servicios de Google (Firebase y Gemini) no están configuradas.
        </p>
        <p className="text-gray-700 mb-4">
          Para solucionarlo, por favor, sigue estos pasos:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
          <li>Crea un fichero llamado <strong><code>.env.local</code></strong> en la carpeta principal del proyecto (al mismo nivel que <code>package.json</code>).</li>
          <li>Abre el fichero y pega el siguiente contenido, reemplazando los valores de ejemplo con tus propias credenciales.</li>
        </ol>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Contenido para <code>.env.local</code>:</h3>
          {/* FIX: Updated variable names to remove VITE_ prefix, aligning with switch to process.env */}
          <pre className="text-sm text-gray-800 bg-gray-200 p-3 rounded overflow-x-auto">
            <code>
{`# Obtén esta clave desde el panel de control de la API de Gemini (Google AI Studio)
API_KEY="AIza..."

# Obtén estas claves desde la configuración de tu proyecto en Firebase
# (Configuración del proyecto > General > Tus apps > App web > Configuración y SDK)
FIREBASE_API_KEY="AIza..."
FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
FIREBASE_PROJECT_ID="tu-proyecto"
FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="1234567890"
FIREBASE_APP_ID="1:1234567890:web:abcdef123456"`}
            </code>
          </pre>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          <span className="font-semibold">Importante:</span> Después de crear o modificar el fichero <code>.env.local</code>, necesitas <strong>detener y reiniciar el servidor de desarrollo</strong> para que los cambios se apliquen.
        </p>
      </div>
    </div>
  );
};

export default ConfigErrorScreen;