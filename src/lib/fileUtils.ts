import { getParse } from './parse';

export class FileUtils {
  static async uploadFile(file: File, name: string): Promise<Parse.File> {
    const Parse = await getParse();
    const parseFile = new Parse.File(name, file, 'image/jpeg');
    return parseFile.save();
  }

  static async uploadImage(file: File, fileName: string, isRegistration: boolean = false): Promise<Parse.File> {
    try {
      const Parse = await getParse();
      
      // Créer directement un Parse.File
      const parseFile = new Parse.File(fileName, file, 'image/png');
      
      // Sauvegarder le fichier
      await parseFile.save();

      // Si ce n'est pas une inscription, on crée une ACL pour le fichier
      if (!isRegistration) {
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        // On ne peut pas définir d'ACL directement sur un fichier Parse
        // L'ACL sera gérée au niveau de l'objet qui contient le fichier
      }

      return parseFile;
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  }

  static async deleteFile(file: Parse.File): Promise<void> {
    await file.destroy();
  }

  static getFileUrl(file: Parse.File): string {
    return file.url();
  }
}
