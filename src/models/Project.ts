import Parse from 'parse';

export type ProjectStatus = 'À faire' | 'En cours' | 'Terminé';
export type ProjectRole = 'owner' | 'member';

export interface ProjectAttributes {
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate: Date;
  owner: Parse.User;
  coverImage?: Parse.File;
  teamMembers?: Parse.User[];
  documents?: Parse.Object[];
  role?: ProjectRole;
}

export default class Project extends Parse.Object<ProjectAttributes> {
  constructor(attributes?: Partial<ProjectAttributes>) {
    super('Project', attributes as ProjectAttributes);
  }

  //méthode statique pour créer des requêtes Parse
  static query(): Parse.Query<Project> {
    return new Parse.Query(Project);
  }

  get name(): string {
    return this.get('name');
  }

  set name(value: string) {
    this.set('name', value);
  }

  get description(): string {
    return this.get('description');
  }

  set description(value: string) {
    this.set('description', value);
  }

  get status(): ProjectStatus {
    return this.get('status');
  }

  set status(value: ProjectStatus) {
    this.set('status', value);
  }

  get dueDate(): Date {
    return this.get('dueDate');
  }

  set dueDate(value: Date) {
    this.set('dueDate', value);
  }

  get owner(): Parse.User {
    return this.get('owner');
  }

  set owner(value: Parse.User) {
    this.set('owner', value);
  }

  get coverImage(): Parse.File | undefined {
    return this.get('coverImage');
  }

  set coverImage(value: Parse.File | undefined) {
    this.set('coverImage', value);
  }

  get teamMembers(): Parse.User[] {
    return this.get('teamMembers') || [];
  }

  set teamMembers(value: Parse.User[]) {
    this.set('teamMembers', value);
  }

  get documents(): Parse.Object[] {
    return this.get('documents') || [];
  }

  set documents(value: Parse.Object[]) {
    this.set('documents', value);
  }

  get role(): ProjectRole | undefined {
    return this.get('role');
  }

  set role(value: ProjectRole | undefined) {
    this.set('role', value);
  }

  async isTeamMember(user: Parse.User): Promise<boolean> {
    return this.teamMembers.some(member => member.id === user.id);
  }

  addTeamMember(user: Parse.User): void {
    const currentMembers = this.teamMembers;
    if (!currentMembers.some(m => m.id === user.id)) {
      this.set('teamMembers', [...currentMembers, user]);
    }
  }

  removeTeamMember(user: Parse.User): void {
    const currentMembers = this.teamMembers;
    this.set('teamMembers', currentMembers.filter(m => m.id !== user.id));
  }
}

Parse.Object.registerSubclass('Project', Project); 