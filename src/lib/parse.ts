import Parse from 'parse';

// Initialisation de Parse
Parse.initialize(
  process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || '',
  process.env.NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY || ''
);

// Configuration du serveur Parse
Parse.serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL || 'http://localhost:1337/parse';

export default Parse; 