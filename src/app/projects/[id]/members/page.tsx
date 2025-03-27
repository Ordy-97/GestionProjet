'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Project from '@/models/Project';
import { useAuth } from '@/hooks/useAuth';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import Parse from 'parse';

interface ProjectMembersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectMembersPage({ params }: ProjectMembersPageProps) {
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<Parse.User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [teamMembers, setTeamMembers] = useState<Parse.User[]>([]);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Début de la récupération des utilisateurs');
        
        const query = new Parse.Query(Parse.User);
        query.limit(100);
        query.select('username', 'email'); 
        
        // Exclure l'utilisateur courant
        if (user?.id) {
          query.notEqualTo('objectId', user.id);
        }
        
        console.log('Requête Parse créée avec les conditions:', {
          excludeCurrentUser: user?.id
        });
        
        const results = await query.find();
        console.log('Résultats bruts de la requête:', results);
        
        if (results && results.length > 0) {
          console.log('Nombre d\'utilisateurs trouvés:', results.length);
          results.forEach((user: Parse.User) => {
            console.log('Utilisateur:', {
              id: user.id,
              username: user.get('username'),
              email: user.get('email')
            });
          });
        } else {
          console.log('Aucun utilisateur trouvé');
        }
        
        setUsers(results);
      } catch (error) {
        console.error('Erreur détaillée lors de la récupération des utilisateurs:', error);
        setError('Erreur lors de la récupération des utilisateurs');
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProjectAndMembers = async () => {
      try {
        const query = Project.query()
          .equalTo('objectId', resolvedParams.id)
          .include('owner')
          .include('teamMembers');
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
        setTeamMembers(teamMembers);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndMembers();
  }, [resolvedParams.id, user, router, authLoading]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedUserId) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const newMember = users.find(u => u.id === selectedUserId);
      if (!newMember) {
        setError('Utilisateur non trouvé');
        return;
      }

      const isMember = await project.isTeamMember(newMember);
      if (isMember) {
        setError('Cet utilisateur est déjà membre du projet');
        return;
      }

      project.addTeamMember(newMember);
      await project.save();
      setProject(project);
      setTeamMembers(project.teamMembers);
      setSelectedUserId('');
      setSuccess('Membre ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      setError('Une erreur est survenue lors de l\'ajout du membre');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!project) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const memberToRemove = users.find(u => u.id === memberId);
      if (!memberToRemove) {
        setError('Membre non trouvé');
        return;
      }

      project.removeTeamMember(memberToRemove);
      await project.save();
      setProject(project);
      setTeamMembers(project.teamMembers);
      setSuccess('Membre retiré avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      setError('Une erreur est survenue lors de la suppression du membre');
    } finally {
      setSaving(false);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/projects/${resolvedParams.id}`}
            className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
          >
            ← Retour au projet
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Membres du projet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez les membres de l&apos;équipe
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
                {success}
              </div>
            )}

            {project?.owner.id === user?.id && (
              <form onSubmit={handleAddMember} className="mb-6">
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white p-2 border-2 text-gray-900 font-medium"
                    required
                  >
                    <option value="" className="text-gray-500 py-2 font-medium">Sélectionner un membre</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id} className="text-gray-900 py-2 font-medium">
                        {user.get('username')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={saving || !selectedUserId}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {/* Propriétaire */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {project?.owner.get('username').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {project?.owner.get('username')}
                    </p>
                    <p className="text-xs text-gray-500">Propriétaire</p>
                  </div>
                </div>
              </div>

              {/* Membres de l'équipe */}
              {teamMembers.length > 0 && (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {member.get('username').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {member.get('username')}
                          </p>
                          <p className="text-xs text-gray-500">Collaborateur</p>
                        </div>
                      </div>
                      {project?.owner.id === user?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={saving}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {teamMembers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun membre d&apos;équipe pour le moment
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 