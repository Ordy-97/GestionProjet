'use client';

import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Bienvenue sur GestionProjet
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre solution simple et efficace pour gérer vos projets
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-700 leading-relaxed">
              GestionProjet vous permet de :
            </p>
            <ul className="mt-4 text-left text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="text-indigo-500 mr-2">•</span>
                Créer et organiser vos projets
              </li>
              <li className="flex items-center">
                <span className="text-indigo-500 mr-2">•</span>
                Suivre l&apos;avancement de vos tâches
              </li>
              <li className="flex items-center">
                <span className="text-indigo-500 mr-2">•</span>
                Gérer les dates limites
              </li>
              <li className="flex items-center">
                <span className="text-indigo-500 mr-2">•</span>
                Collaborer efficacement
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
