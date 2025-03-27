'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Project from '@/models/Project';
import Document from '@/models/Document';
import { useAuth } from '@/hooks/useAuth';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import { FileUtils } from '@/lib/fileUtils';

interface ProjectDocumentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDocumentsPage({ params }: ProjectDocumentsPageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchProjectAndDocuments = async () => {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isOwner = result.owner && result.owner.id === user?.id;
        const teamMembers = result.teamMembers || [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isMember = Array.isArray(teamMembers) && teamMembers.some(member => member.id === user?.id);
        
        // if (!isOwner && !isMember) {
        //   setError('Vous n\'avez pas accès à ce projet');
        //   return;
        // }

        setProject(result);

        // Récupérer les documents avec toutes les relations nécessaires
        const documentsQuery = Document.query()
          .equalTo('project', result)
          .include('file')
          .include('uploadedBy')
          .include('project')
          .descending('uploadDate');
        const docs = await documentsQuery.find();
        
        // Vérifier et logger les documents pour le débogage
        console.log('Documents récupérés:', docs.map(doc => {
          const file = doc.get('file');
          const uploadedBy = doc.get('uploadedBy');
          console.log('Document brut:', doc);
          console.log('File:', file);
          console.log('UploadedBy:', uploadedBy);
          
          return {
            id: doc.id,
            name: doc.get('name'),
            description: doc.get('description'),
            uploadedBy: uploadedBy?.get('username'),
            uploadDate: doc.get('uploadDate'),
            file: file?.url(),
            project: doc.get('project')?.id
          };
        }));
        
        setDocuments(docs);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndDocuments();
  }, [resolvedParams.id, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project || !user) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const parseFile = await FileUtils.uploadFile(file, file.name);
      
      const document = new Document({
        name: file.name,
        file: parseFile,
        project: project,
        uploadedBy: user,
        uploadDate: new Date()
      });

      await document.save();
      setDocuments(prev => [document, ...prev]);
      setSuccess('Document ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Une erreur est survenue lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      console.log('Document à supprimer:', document);
      const uploadedBy = document.get('uploadedBy');
      console.log('UploadedBy:', uploadedBy);

      // Vérifier si l'utilisateur est propriétaire du projet ou du document
      const isProjectOwner = project?.owner.id === user?.id;
      const isDocumentOwner = uploadedBy?.id === user?.id;

      if (!isProjectOwner && !isDocumentOwner) {
        setError('Vous n\'avez pas les droits pour supprimer ce document');
        return;
      }

      await FileUtils.deleteFile(document.file);
      await document.destroy();
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      setSuccess('Document supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Une erreur est survenue lors de la suppression du document');
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
          <h1 className="text-3xl font-bold text-gray-900">Documents du projet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez les documents associés à ce projet
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter un document
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-4">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun document pour le moment
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-gray-400"
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
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {doc.name || 'Sans titre'}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {doc.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Ajouté par {doc.uploadedBy?.get('username') || 'Utilisateur inconnu'} le{' '}
                          {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={FileUtils.getFileUrl(doc.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Télécharger
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 