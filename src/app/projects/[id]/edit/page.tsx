'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Project, { ProjectStatus } from '@/models/Project';
import { useAuth } from '@/hooks/useAuth';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import { FileUtils } from '@/lib/fileUtils';
import Parse from 'parse';

interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resolvedParams = use(params);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'À faire' as ProjectStatus,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const query = Project.query()
          .equalTo('objectId', resolvedParams.id)
          .include('owner');
        const result = await query.first();
        
        if (!result) {
          setError('Projet non trouvé');
          return;
        }

        // const owner = result.get('owner');
        // if (!owner || !user || owner.id !== user.id) {
        //   setError('Vous n\'avez pas accès à ce projet');
        //   return;
        // }

        const dueDate = result.get('dueDate');
        setFormData({
          name: result.get('name') || '',
          description: result.get('description') || '',
          dueDate: dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : '',
          status: result.get('status') || 'À faire',
        });
      } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        setError('Une erreur est survenue lors de la récupération du projet');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [resolvedParams.id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Vous devez être connecté pour modifier un projet');
      setLoading(false);
      return;
    }

    try {
      let coverImageFile: Parse.File | undefined;
      if (coverImage) {
        coverImageFile = await FileUtils.uploadImage(coverImage, `cover-${formData.name}`);
      }

      const project = await Project.query().get(resolvedParams.id);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Mettre à jour les champs du projet
      project.set('name', formData.name);
      project.set('description', formData.description);
      project.set('status', formData.status);
      project.set('dueDate', new Date(formData.dueDate));
      
      if (coverImageFile) {
        project.set('coverImage', coverImageFile);
      }

      // Créer une ACL pour le projet
      const acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(user, true);
      project.setACL(acl);

      await project.save();
      router.push(`/projects/${resolvedParams.id}`);
    } catch (error) {
      console.error('Erreur lors de la modification du projet:', error);
      setError('Une erreur est survenue lors de la modification du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Modifier le projet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Modifiez les informations du projet
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
                Nom du projet
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
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Date limite
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                Image de couverture (optionnel)
              </label>
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {coverImage && (
                <p className="mt-1 text-sm text-gray-500">
                  Image sélectionnée : {coverImage.name}
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 