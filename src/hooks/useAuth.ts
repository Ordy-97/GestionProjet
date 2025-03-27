import { useState, useEffect } from 'react';
import Parse from '../lib/parse';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserAttributes {
  email: string | null;
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<Parse.User | null>(() => Parse.User.current() || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = Parse.User.current();
        if (currentUser) {
          // Vérifie si la session est toujours valide
          try {
            await currentUser.fetch();
            setUser(currentUser);
          } catch (error) {
            console.error('Session expirée:', error);
            await Parse.User.logOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const loggedInUser = await Parse.User.logIn(username, password);
      setUser(loggedInUser);
      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error };
    }
  };

  const signUp = async (username: string, password: string, email: string) => {
    try {
      const user = new Parse.User();
      user.set('username', username);
      user.set('password', password);
      user.set('email', email);
  
      // Créer une ACL avec accès en lecture public et accès d'écriture uniquement pour l'utilisateur
      const userACL = new Parse.ACL();
      userACL.setPublicReadAccess(true); // Lecture publique activée
      //userACL.setWriteAccess(user.id, true); // Écriture uniquement pour l'utilisateur lui-même
  
      user.setACL(userACL); // Associer l'ACL à l'utilisateur
  
      const signedUpUser = await user.signUp();
      setUser(signedUpUser);
      return { success: true };
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      return { success: false, error };
    }
  };
  

  const signOut = async () => {
    try {
      await Parse.User.logOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return { success: false, error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}; 