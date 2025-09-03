
import React, { useState } from 'react';
import SpinnerIcon from './icons/SpinnerIcon';

interface ConfigPanelProps {
  onGenerate: (startDate: string, duration: number, preferences: string, includeBreakfasts: boolean) => void;
  isLoading: boolean;
  isDemoMode: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onGenerate, isLoading, isDemoMode }) => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Default to tomorrow
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [duration, setDuration] = useState('7');
  const [preferences, setPreferences] = useState('');
  const [includeBreakfasts, setIncludeBreakfasts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) return;
    onGenerate(startDate, parseInt(duration, 10), preferences, includeBreakfasts);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full lg:w-96 lg:flex-shrink-0">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configuración del Menú</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duración
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="7">1 Semana</option>
            <option value="14">2 Semanas</option>
          </select>
        </div>
         <div className="flex items-center">
          <input
            id="include-breakfasts"
            type="checkbox"
            checked={includeBreakfasts}
            onChange={(e) => setIncludeBreakfasts(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="include-breakfasts" className="ml-2 block text-sm text-gray-900">
            Incluir desayunos (opcional)
          </label>
        </div>
        <div>
          <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
            Preferencias y exclusiones (opcional)
          </label>
          <textarea
            id="preferences"
            rows={4}
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: vegetariano, sin gluten, me encantan las lentejas, no me gusta el pescado..."
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading || isDemoMode}
            title={isDemoMode ? "La generación con IA está deshabilitada en el modo de demostración." : ""}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <SpinnerIcon /> : 'Generar Menú con IA'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigPanel;
