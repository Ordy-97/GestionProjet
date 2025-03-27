import { useState, useEffect } from 'react';
import { getParse } from '../lib/parse';

interface UserAttributes {
  email: string | null;
  username: string;
  avatar?: unknown;
}

export const useAuth = () => {
  const [user, setUser] = useState<Parse.User<UserAttributes> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const Parse = await getParse();
        const currentUser = Parse.User.current();
        if (currentUser) {
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
      const Parse = await getParse();
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
      const Parse = await getParse();
      const user = new Parse.User();
      user.set('username', username);
      user.set('password', password);
      user.set('email', email);
  
      // Créer une ACL avec accès en lecture public
      const userACL = new Parse.ACL();
      userACL.setPublicReadAccess(true);
      user.setACL(userACL);
  
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
      const Parse = await getParse();
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