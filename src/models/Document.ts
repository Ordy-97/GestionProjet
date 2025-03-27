import Parse from 'parse';

interface DocumentAttributes {
  name: string;
  description?: string;
  file: Parse.File;
  project: Parse.Object;
  uploadedBy: Parse.User;
  uploadDate: Date;
}

class Document extends Parse.Object {
  constructor(attributes: DocumentAttributes) {
    super('Document', attributes);
  }

  static query(): Parse.Query<Document> {
    return new Parse.Query(Document);
  }

  get name(): string {
    return this.get('name');
  }

  set name(value: string) {
    this.set('name', value);
  }

  get description(): string | undefined {
    return this.get('description');
  }

  set description(value: string | undefined) {
    this.set('description', value);
  }

  get file(): Parse.File {
    return this.get('file');
  }

  set file(value: Parse.File) {
    this.set('file', value);
  }

  get project(): Parse.Object {
    return this.get('project');
  }

  set project(value: Parse.Object) {
    this.set('project', value);
  }

  get uploadedBy(): Parse.User {
    return this.get('uploadedBy');
  }

  set uploadedBy(value: Parse.User) {
    this.set('uploadedBy', value);
  }

  get uploadDate(): Date {
    return this.get('uploadDate');
  }

  set uploadDate(value: Date) {
    this.set('uploadDate', value);
  }
}

Parse.Object.registerSubclass('Document', Document);

export default Document; 