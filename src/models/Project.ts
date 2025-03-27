import Parse from 'parse';

export type ProjectStatus = 'À faire' | 'En cours' | 'Terminé';
export type ProjectRole = 'owner' | 'member';

interface ProjectAttributes {
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate: Date;
  owner: Parse.User;
  teamMembers?: Parse.User[];
  role?: ProjectRole;
}

class Project extends Parse.Object {
  constructor(attributes: ProjectAttributes) {
    super('Project', attributes);
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

  get teamMembers(): Parse.User[] {
    return this.get('teamMembers') || [];
  }

  set teamMembers(value: Parse.User[]) {
    this.set('teamMembers', value || []);
  }

  get role(): ProjectRole {
    return this.get('role') || 'member';
  }

  set role(value: ProjectRole) {
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

export default Project; 