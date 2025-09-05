import React, { useState } from 'react';
import type { SavedMenu } from '../types';
import { getFormattedDate } from '../utils/dateUtils';
import TrashIcon from './icons/TrashIcon';

interface SavedMenusTabProps {
  savedMenus: SavedMenu[];
  onDeleteMenu: (id: string) => void;
  error: string | null;
  clearError: () => void;
}

const SavedMenuItem: React.FC<{ menu: SavedMenu; onDelete: (id: string) => void }> = ({ menu, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortedDays = Object.keys(menu.menuPlan).sort();

  return (
    <div className="border rounded-lg bg-gray-50 overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
        aria-controls={`menu-${menu.id}`}
      >
        <div>
          <h3 className="font-bold text-lg text-gray-900">Menú Semanal</h3>
          <p className="text-sm text-gray-600">
            Del {getFormattedDate(menu.startDate)} al {getFormattedDate(menu.endDate)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
              onClick={(e) => {
                  e.stopPropagation();
                  onDelete(menu.id);
              }}
              className="text-gray-500 hover:text-red-600 transition-colors"
              aria-label={`Eliminar menú del ${menu.startDate}`}
          >
              <TrashIcon className="w-5 h-5" />
          </button>
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div id={`menu-${menu.id}`} className="p-4 border-t bg-white">
           <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-1">
                {sortedDays.map(day => (
                  <div key={day} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col">
                    <h3 className="font-bold text-center text-sm text-gray-700 capitalize mb-2">{getFormattedDate(day)}</h3>
                    <div className="space-y-2 flex-grow">
                      {menu.menuPlan[day].breakfast && (
                        <div className="border-t pt-2">
                          <p className="text-xs font-semibold text-gray-500">DESAYUNO</p>
                          {/* Fix: Render the .name property of the meal object instead of the object itself. */}
                          <p className="text-sm text-gray-800">{menu.menuPlan[day].breakfast!.name}</p>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <p className="text-xs font-semibold text-gray-500">COMIDA</p>
                        {/* Fix: Render the .name property of the meal object instead of the object itself. */}
                        <p className="text-sm text-gray-800">{menu.menuPlan[day].lunch.name}</p>
                      </div>
                       <div className="border-t pt-2">
                        <p className="text-xs font-semibold text-gray-500">CENA</p>
                        {/* Fix: Render the .name property of the meal object instead of the object itself. */}
                        <p className="text-sm text-gray-800">{menu.menuPlan[day].dinner.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      )}
    </div>
  );
};


const SavedMenusTab: React.FC<SavedMenusTabProps> = ({ savedMenus, onDeleteMenu, error, clearError }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-6xl">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Menús Guardados</h2>
      </div>
      
      {error && (
        <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex justify-between items-center" role="alert">
          <span>
            <strong>Error:</strong> {error}
          </span>
          <button onClick={clearError} className="p-1 rounded-full hover:bg-red-100" aria-label="Cerrar notificación">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

       {savedMenus.length > 0 ? (
        <div className="space-y-4">
          {savedMenus.map((menu) => (
            <SavedMenuItem key={menu.id} menu={menu} onDelete={onDeleteMenu} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No tienes menús guardados.</p>
          <p className="text-sm">Genera un menú y guárdalo para verlo aquí.</p>
        </div>
      )}

    </div>
  );
};

export default SavedMenusTab;