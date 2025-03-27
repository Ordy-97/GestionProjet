'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import { FileUtils } from '@/lib/fileUtils';
import Document from '@/models/Document';
import Project from '@/models/Project';

interface NewDocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewDocumentPage({ params }: NewDocumentPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resolvedParams = use(params);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Récupérer le projet
      const project = await Project.query()
        .equalTo('objectId', resolvedParams.id)
        .first();

      if (!project) {
        setError('Projet non trouvé');
        return;
      }

      const parseFile = await FileUtils.uploadFile(file, file.name);
      
      const document = new Document({
        name: formData.name,
        description: formData.description,
        file: parseFile,
        project: project,
        uploadedBy: user,
        uploadDate: new Date()
      });

      await document.save();
      router.push(`/projects/${resolvedParams.id}/documents`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      setError('Une erreur est survenue lors de l\'ajout du document');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        e.target.value = '';
        return;
      }
      setFile(file);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/projects/${resolvedParams.id}`}
            className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
          >
            ← Retour au projet
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau document</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ajoutez un nouveau document au projet
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du document
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Fichier
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".pdf"
                required
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-900
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              {file && (
                <p className="mt-1 text-sm text-gray-500">
                  Fichier sélectionné : {file.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/projects/${resolvedParams.id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 