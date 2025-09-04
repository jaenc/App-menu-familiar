

import React, { useState } from 'react';
import type { Profile } from '../types';
import ProfileFormModal from './ProfileFormModal';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

interface ProfilesTabProps {
  profiles: Profile[];
  onAddProfile: (newProfile: Omit<Profile, 'id'>) => void;
  onUpdateProfile: (updatedProfile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  error: string | null;
  clearError: () => void;
}

const ProfilesTab: React.FC<ProfilesTabProps> = ({ profiles, onAddProfile, onUpdateProfile, onDeleteProfile, error, clearError }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const handleOpenAddModal = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const handleSaveProfile = (profileData: Omit<Profile, 'id'>) => {
    if (editingProfile) {
      onUpdateProfile({ ...profileData, id: editingProfile.id });
    } else {
      onAddProfile(profileData);
    }
    handleCloseModal();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Perfiles Familiares</h2>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Añadir Perfil
        </button>
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

      {profiles.length > 0 ? (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600">
                  {profile.age} años, {profile.gender}, Actividad {profile.activityLevel}
                </p>
                {profile.notes && <p className="text-sm text-gray-500 mt-1">Notas: {profile.notes}</p>}
              </div>
              <div className="flex items-center space-x-4">
                <button
                    onClick={() => handleOpenEditModal(profile)}
                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                    aria-label={`Editar perfil de ${profile.name}`}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onDeleteProfile(profile.id)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    aria-label={`Eliminar perfil de ${profile.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No hay perfiles guardados.</p>
          <p className="text-sm">Añade perfiles para personalizar tus menús.</p>
        </div>
      )}

      {isModalOpen && (
        <ProfileFormModal
          onClose={handleCloseModal}
          onSave={handleSaveProfile}
          profile={editingProfile || undefined}
        />
      )}
    </div>
  );
};

export default ProfilesTab;