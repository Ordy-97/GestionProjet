'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Project from '@/models/Project';
import { useAuth } from '@/hooks/useAuth';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import { FileUtils } from '@/lib/fileUtils';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const resolvedParams = use(params);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const query = Project.query()
          .equalTo('objectId', resolvedParams.id)
          .include(['owner', 'teamMembers'])
          .include(['documents']);
        const result = await query.first();
        
        if (!result) {
          setError('Projet non trouvé');
          return;
        }

        // Vérifier si l'utilisateur est propriétaire ou membre
        const isOwner = result.owner && result.owner.id === user.id;
        const teamMembers = result.teamMembers || [];
        const isMember = Array.isArray(teamMembers) && teamMembers.some(member => member.id === user.id);
        
        if (!isOwner && !isMember) {
          setError('Vous n\'avez pas accès à ce projet');
          return;
        }

        setProject(result);
      } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        setError('Une erreur est survenue lors de la récupération du projet');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [resolvedParams.id, user, router, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-center">{error}</div>
            <div className="mt-4 text-center">
              <Link
                href="/projects"
                className="text-indigo-600 hover:text-indigo-900"
              >
                Retour aux projets
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
          >
            ← Retour aux projets
          </Link>
        </div>
        {loading ? (
          <div className="text-center">Chargement...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : project ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {project.coverImage && (
              <div className="relative h-64">
                <Image
                  src={FileUtils.getFileUrl(project.coverImage)}
                  alt={`Couverture du projet ${project.name}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="mt-2 text-gray-600">{project.description}</p>
                </div>
                {project.owner && user && project.owner.id === user.id && (
                  <Link
                    href={`/projects/${resolvedParams.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Modifier
                  </Link>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Informations</h2>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Statut</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'Terminé' ? 'bg-green-100 text-green-800' :
                          project.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date limite</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Équipe</h2>
                  <div className="mt-4">
                    <Link
                      href={`/projects/${resolvedParams.id}/members`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Gérer les membres
                    </Link>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/projects/${resolvedParams.id}/documents/new`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Ajouter un document
                      </Link>
                      <Link
                        href={`/projects/${resolvedParams.id}/documents`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Gérer les documents
                      </Link>
                    </div>

                    {/* Liste des documents */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">Documents du projet</h3>
                      <div className="space-y-4">
                        {project.documents && project.documents.length > 0 ? (
                          project.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center space-x-3">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">{doc.get('title')}</h4>
                                  <p className="text-sm text-gray-500">
                                    Ajouté par {doc.get('uploadedBy')?.get('username')} le{' '}
                                    {new Date(doc.get('uploadDate')).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={FileUtils.getFileUrl(doc.get('file'))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Télécharger
                              </a>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Aucun document</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
} 