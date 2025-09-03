import React, { useState } from 'react';
import type { Profile } from '../types';

interface ProfileFormModalProps {
  onClose: () => void;
  onSave: (profile: Omit<Profile, 'id'>) => void;
  profile?: Profile; // Optional for editing
}

const ProfileFormModal: React.FC<ProfileFormModalProps> = ({ onClose, onSave, profile }) => {
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState<number | ''>(profile?.age || 18);
  const [gender, setGender] = useState<'Hombre' | 'Mujer' | 'Otro'>(profile?.gender || 'Mujer');
  const [activityLevel, setActivityLevel] = useState<'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto'>(profile?.activityLevel || 'Moderado');
  const [notes, setNotes] = useState(profile?.notes || '');
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || age === '' || age <= 0) {
      setError('Por favor, completa el nombre y una edad válida.');
      return;
    }
    onSave({ name, age, gender, activityLevel, notes });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{profile ? 'Editar' : 'Añadir'} Perfil</h2>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad</label>
                <input type="number" id="age" value={age} onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required min="1" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                <select id="gender" value={gender} onChange={e => setGender(e.target.value as any)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option>Mujer</option>
                  <option>Hombre</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Nivel de Actividad</label>
                <select id="activityLevel" value={activityLevel} onChange={e => setActivityLevel(e.target.value as any)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option>Bajo</option>
                  <option>Moderado</option>
                  <option>Alto</option>
                  <option>Muy Alto</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas (e.g., Deportista, alergias)</label>
                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileFormModal;