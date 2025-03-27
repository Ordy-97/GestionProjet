'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Project from '@/models/Project';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { FileUtils } from '@/lib/fileUtils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        // Récupérer les projets dont l'utilisateur est propriétaire
        const ownedProjectsQuery = Project.query()
          .equalTo('owner', user)
          .include('owner');
        
        // Récupérer les projets où l'utilisateur est membre
        const memberProjectsQuery = Project.query()
          .contains('teamMembers', user.id)
          .include('owner')
          .include('teamMembers');
        
        const [ownedProjects, memberProjects] = await Promise.all([
          ownedProjectsQuery.find(),
          memberProjectsQuery.find()
        ]);

        // Combiner les projets et ajouter un indicateur de rôle
        const allProjects = [
          ...ownedProjects.map(project => {
            project.role = 'owner';
            return project;
          }),
          ...memberProjects.map(project => {
            project.role = 'member';
            return project;
          })
        ];

        setProjects(allProjects);
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, router, authLoading]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            Nouveau projet
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Chargement...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer un nouveau projet.
            </p>
            <div className="mt-6">
              <Link
                href="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                Nouveau projet
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative h-48">
                  {project.coverImage ? (
                    <img
                      src={FileUtils.getFileUrl(project.coverImage)}
                      alt="Image de couverture"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'À faire'
                          ? 'bg-yellow-100 text-yellow-800'
                          : project.status === 'En cours'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        Date limite : {project.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.role === 'owner'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {project.role === 'owner' ? 'Propriétaire' : 'Collaborateur'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 