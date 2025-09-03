import React from 'react';

interface LoginScreenProps {
  onLogin: () => void;
  isLoading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Comida<span className="text-indigo-600">A</span>Casa AI Planner
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Tu planificador de menús inteligente y personalizado.
            </p>
        </header>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-gray-600 mb-6">Inicia sesión para guardar tus menús, perfiles y recetas en la nube.</p>
            <button
                onClick={onLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
                {isLoading ? 'Iniciando...' : 'Iniciar sesión con Google'}
            </button>
        </div>
    </div>
  );
};

export default LoginScreen;
