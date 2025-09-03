import React from 'react';
import type { MenuPlan } from '../types';
import { getFormattedDate } from '../utils/dateUtils';
import SpinnerIcon from './icons/SpinnerIcon';

interface MenuDisplayProps {
  menuPlan: MenuPlan | null;
  isLoading: boolean;
  error: string | null;
  onSelectMeal: (mealName: string) => void;
  onGenerateShoppingList: () => void;
}

const MenuDisplay: React.FC<MenuDisplayProps> = ({ menuPlan, isLoading, error, onSelectMeal, onGenerateShoppingList }) => {
  const sortedDays = menuPlan ? Object.keys(menuPlan).sort() : [];
  
  const handlePrint = () => {
    if (!menuPlan || sortedDays.length === 0) return;

    const printContent = `
      <html>
        <head>
          <title>Menú Semanal</title>
          <style>
            @page {
              size: landscape;
              margin: 1cm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1f2937;
            }
            h1 {
              text-align: center;
              font-size: 1.5rem;
              font-weight: bold;
              margin-bottom: 1.5rem;
              color: #111827;
            }
            .menu-grid {
              display: grid;
              grid-template-columns: repeat(${sortedDays.length > 7 ? '7' : sortedDays.length}, 1fr);
              gap: 0.5rem;
            }
            .day-card {
              border: 1px solid #e5e7eb;
              border-radius: 0.5rem;
              padding: 0.75rem;
              display: flex;
              flex-direction: column;
              break-inside: avoid;
            }
            .day-card h3 {
              font-weight: bold;
              text-align: center;
              font-size: 0.9rem;
              text-transform: capitalize;
              margin-bottom: 0.5rem;
              color: #374151;
            }
            .meal {
              border-top: 1px solid #f3f4f6;
              padding-top: 0.5rem;
              margin-top: 0.5rem;
            }
            .meal-title {
              font-size: 0.7rem;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
            }
            .meal-name {
              font-size: 0.85rem;
              color: #111827;
            }
          </style>
        </head>
        <body>
          <h1>Tu Menú Personalizado</h1>
          <div class="menu-grid">
            ${sortedDays.map(day => `
              <div class="day-card">
                <h3>${getFormattedDate(day)}</h3>
                <div class="meals-container">
                  ${menuPlan[day].breakfast ? `
                    <div class="meal">
                      <p class="meal-title">DESAYUNO</p>
                      <p class="meal-name">${menuPlan[day].breakfast}</p>
                    </div>
                  ` : ''}
                  <div class="meal">
                    <p class="meal-title">COMIDA</p>
                    <p class="meal-name">${menuPlan[day].lunch}</p>
                  </div>
                  <div class="meal">
                    <p class="meal-title">CENA</p>
                    <p class="meal-name">${menuPlan[day].dinner}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
        alert("Por favor, permite las ventanas emergentes para imprimir el menú.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <SpinnerIcon className="w-12 h-12 mb-4" />
          <p className="text-lg">Generando tu menú personalizado...</p>
          <p className="text-sm">Esto puede tardar un momento.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-center">
            <h3 className="font-bold">Error en la Generación</h3>
            <p>{error}</p>
        </div>
      );
    }

    if (!menuPlan || sortedDays.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10h6M9 7h6" /></svg>
          <p className="text-lg">Tu menú personalizado aparecerá aquí.</p>
          <p className="text-sm">Usa el panel de la izquierda para comenzar.</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tu Menú Personalizado</h2>
            <div className="flex gap-2">
                <button 
                  onClick={onGenerateShoppingList}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Lista de la Compra
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 border border-transparent rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Exportar a PDF
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-1">
            {sortedDays.map(day => (
              <div key={day} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col">
                <h3 className="font-bold text-center text-sm text-gray-700 capitalize mb-2">{getFormattedDate(day)}</h3>
                <div className="space-y-2 flex-grow">
                  {menuPlan[day].breakfast && (
                    <div className="border-t pt-2">
                      <p className="text-xs font-semibold text-gray-500">DESAYUNO</p>
                      <button onClick={() => onSelectMeal(menuPlan[day].breakfast!)} className="text-left text-sm text-indigo-600 hover:underline hover:text-indigo-800 transition-colors w-full">
                        {menuPlan[day].breakfast}
                      </button>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold text-gray-500">COMIDA</p>
                    <button onClick={() => onSelectMeal(menuPlan[day].lunch)} className="text-left text-sm text-indigo-600 hover:underline hover:text-indigo-800 transition-colors w-full">
                      {menuPlan[day].lunch}
                    </button>
                  </div>
                   <div className="border-t pt-2">
                    <p className="text-xs font-semibold text-gray-500">CENA</p>
                    <button onClick={() => onSelectMeal(menuPlan[day].dinner)} className="text-left text-sm text-indigo-600 hover:underline hover:text-indigo-800 transition-colors w-full">
                      {menuPlan[day].dinner}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-grow">
      {renderContent()}
    </div>
  );
};

export default MenuDisplay;