import Parse from '@/lib/parse';

export type ProjectStatus = 'À faire' | 'En cours' | 'Terminé';

export interface ProjectAttributes {
  name?: string;
  description?: string;
  dueDate?: Date;
  status?: ProjectStatus;
  owner?: Parse.User;
}

export class Project extends Parse.Object<ProjectAttributes> {
  constructor(attributes?: ProjectAttributes) {
    super('Project', attributes || {});
  }

  //méthode statique pour créer des requêtes Parse
  static query(): Parse.Query<Project> {
    return new Parse.Query(Project);
  }

  get name(): string {
    return this.get('name') || '';
  }

  set name(value: string) {
    this.set('name', value);
  }

  get description(): string {
    return this.get('description') || '';
  }

  set description(value: string) {
    this.set('description', value);
  }

  get dueDate(): Date {
    return this.get('dueDate') || new Date();
  }

  set dueDate(value: Date) {
    this.set('dueDate', value);
  }

  get status(): ProjectStatus {
    return this.get('status') || 'À faire';
  }

  set status(value: ProjectStatus) {
    this.set('status', value);
  }

  get owner(): Parse.User | undefined {
    return this.get('owner');
  }

  set owner(value: Parse.User | undefined) {
    this.set('owner', value);
  }
}

Parse.Object.registerSubclass('Project', Project);

export default Project; 