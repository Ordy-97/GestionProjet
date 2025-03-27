// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Parse: any = null;

if (typeof window !== 'undefined') {
  // Initialisation immédiate de Parse
  import('parse').then((module) => {
    Parse = module.default;
    
    // Initialisation de Parse
    Parse.initialize(
      process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || '',
      process.env.NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY || ''
    );

    // Configuration du serveur Parse
    Parse.serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL || 'http://localhost:1337/parse';

    // Configuration des ACL par défaut pour les fichiers
    Parse.ACL.defaultACL = new Parse.ACL();
    Parse.ACL.defaultACL.setPublicReadAccess(true);
    Parse.ACL.defaultACL.setPublicWriteAccess(true);
  }).catch((error) => {
    console.error('Erreur lors du chargement de Parse:', error);
  });
}

// Fonction pour attendre que Parse soit initialisé
export const getParse = async () => {
  if (!Parse) {
    await new Promise((resolve) => {
      const checkParse = () => {
        if (Parse) {
          resolve(Parse);
        } else {
          setTimeout(checkParse, 100);
        }
      };
      checkParse();
    });
  }
  return Parse;
};

export default Parse; 