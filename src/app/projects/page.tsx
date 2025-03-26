'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Project, { ProjectStatus } from '@/models/Project';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

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
      const query = Project.query()
        .equalTo('owner', user)
        .include('owner');
      
      try {
        const results = await query.find();
        setProjects(results);
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, router, authLoading]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'À faire':
        return 'bg-yellow-100 text-yellow-800';
      case 'En cours':
        return 'bg-blue-100 text-blue-800';
      case 'Terminé':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Nouveau Projet
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500">Vous n&apos;avez pas encore de projets.</p>
            <Link
              href="/projects/new"
              className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block"
            >
              Créer votre premier projet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Date limite: {project.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 