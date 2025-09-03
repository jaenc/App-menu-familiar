import React, { useState, useEffect, useCallback } from 'react';
import type { MenuPlan, ShoppingListItem, Profile } from '../types';
import { generateShoppingList } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';

interface ShoppingListModalProps {
  menuPlan: MenuPlan | null;
  profiles: Profile[];
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ menuPlan, profiles, isOpen, onClose }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShoppingList = useCallback(async () => {
    if (!menuPlan) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await generateShoppingList(menuPlan, profiles);
      setShoppingList(list.map(item => ({ ...item, checked: false })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la lista de la compra.');
    } finally {
      setIsLoading(false);
    }
  }, [menuPlan, profiles]);

  useEffect(() => {
    if (isOpen) {
      fetchShoppingList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToggleItem = (indexToToggle: number) => {
    setShoppingList(prevList =>
      prevList.map((item, index) =>
        index === indexToToggle ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const handlePrint = () => {
    const itemsToPrint = shoppingList.filter(item => !item.checked);
    if (itemsToPrint.length === 0) {
        // We can handle this case better, but for now, we just open the print dialog with a message.
    }

    const groupedToPrint = itemsToPrint.reduce((acc, item) => {
        const category = item.category || 'Otros';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    const sortedCategoriesToPrint = Object.keys(groupedToPrint).sort();
    
    const printContent = `
      <html>
        <head>
          <title>Lista de la Compra</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 2rem; color: #1f2937; }
            h1 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #111827; }
            h2 { font-size: 1.2rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 0.25rem; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 0.75rem; font-size: 1rem; }
            .ingredient { font-weight: 500; color: #374151; }
            .quantity { color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>Lista de la Compra</h1>
          ${sortedCategoriesToPrint.length > 0 ? 
            sortedCategoriesToPrint.map(category => `
              <div>
                <h2>${category}</h2>
                <ul>
                  ${groupedToPrint[category].map(item => `<li><span class="ingredient">${item.ingredient}</span><span class="quantity"> - ${item.quantity} ${item.unit}</span></li>`).join('')}
                </ul>
              </div>
            `).join('')
            : '<p>¡Ya tienes todo lo necesario!</p>'}
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
        alert("Por favor, permite las ventanas emergentes para imprimir la lista.");
    }
  };

  const groupedList = shoppingList.reduce((acc, item) => {
    const category = item.category || 'Otros';
    if (!acc[category]) {
        acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const sortedCategories = Object.keys(groupedList).sort();

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Lista de la Compra</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow">
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <SpinnerIcon className="w-8 h-8 text-indigo-600" />
                <p className="ml-2">Generando lista...</p>
              </div>
            )}
            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-center">
                <p>{error}</p>
              </div>
            )}
            
            {!isLoading && !error && shoppingList.length > 0 && (
                <>
                  <p className="text-sm text-gray-500 mb-4">Marca los artículos que ya tienes en casa. La lista de impresión solo incluirá los elementos no marcados.</p>
                  <div className="space-y-4">
                    {sortedCategories.map(category => (
                        <div key={category}>
                            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4 border-b pb-1 capitalize">{category}</h3>
                            <ul className="space-y-2">
                                {groupedList[category].map((item) => {
                                    const originalIndex = shoppingList.findIndex(i => i.ingredient === item.ingredient && i.category === item.category);
                                    return (
                                        <li key={originalIndex} className="flex items-center">
                                            <input
                                                id={`item-${originalIndex}`}
                                                type="checkbox"
                                                checked={!!item.checked}
                                                onChange={() => handleToggleItem(originalIndex)}
                                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <label 
                                                htmlFor={`item-${originalIndex}`}
                                                className={`ml-3 text-gray-700 flex-grow cursor-pointer ${item.checked ? 'line-through text-gray-400' : ''}`}
                                            >
                                                <span className="font-medium">{item.ingredient}</span>
                                                <span className="text-sm text-gray-500"> - {item.quantity} {item.unit}</span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                  </div>
                </>
            )}
             {!isLoading && !error && shoppingList.length === 0 && (
                <p className="text-center text-gray-500 py-10">La lista de la compra está vacía.</p>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button 
                  onClick={handlePrint}
                  disabled={isLoading || error != null || shoppingList.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                  Imprimir Lista
              </button>
          </div>
        </div>
      </div>
  );
};

export default ShoppingListModal;