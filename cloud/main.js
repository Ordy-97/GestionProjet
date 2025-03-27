Parse.Cloud.define('uploadFile', async (request) => {
  const { file, fileName, isRegistration } = request.params;
  const user = request.user;

  // Si c'est une inscription, on ne vérifie pas l'authentification
  if (!isRegistration && !user) {
    throw new Error('Vous devez être connecté pour uploader un fichier');
  }

  try {
    // Créer un nouveau fichier Parse
    const parseFile = new Parse.File(fileName, file, 'image/png');
    
    // Créer une ACL spécifique pour le fichier
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    if (user) {
      acl.setWriteAccess(user, true);
    }
    parseFile.setACL(acl);

    // Sauvegarder le fichier
    await parseFile.save();

    return {
      url: parseFile.url(),
      name: parseFile.name(),
      objectId: parseFile.objectId
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'upload du fichier: ${error.message}`);
  }
}); 