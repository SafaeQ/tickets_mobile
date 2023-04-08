export interface Departement {
  id: number;
  name: string;
  chef: User;
  depart_type: string;
  status: STATUS;
}

export interface User {
  departements: Departement[];
  id: number;
  name: string;
  username: string;
  entity: Entity;
  team: Team;
  user_type: string;
  status: STATUS;
  role: ROLE;
  access_entity: number[];
  access_team: number[];
  restrictions: Array<{id: number; user: User; departement: Departement}>;
  unreadMessages?: number;
}

export interface Session {
  token: number;
  active: boolean;
}
export interface Entity {
  id: number;
  name: string;
  chef: User;
  status: STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  leader: User;
  departement: Departement;
  status: STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  user: User;
  subject: string;
  assigned_to: User;
  closed_by: string;
  related_ressource: string;
  entity: Entity;
  issuer_team: Team;
  departement: Departement;
  target_team: Team;
  severity: TICKET_SEVERITY;
  last_update: string;
  status: TICKET_STATUS;
  unread: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  user: User;
  ticket: Ticket;
  body: string;
  read: number[];
  createdAt: string;
  updatedAt: string;
}

export enum TICKET_STATUS {
  Open = 'OPEN',
  In_Progress = 'IN PROGRESS',
  Resolved = 'RESOLVED',
  Reopened = 'REOPENED',
  Closed = 'CLOSED',
}

export enum TICKET_SEVERITY {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}
enum STATUS {
  Active = 'active',
  Inactive = 'inactive',
}

export enum ROLE {
  CHEF = 'CHEF',
  TEAMLEADER = 'TEAMLEADER',
  TEAMMEMBER = 'TEAMMEMBER',
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMINISTRATION',
}

export interface GlobalState {
  isAuthenticated: boolean;
  user: User | undefined;
}

interface Filter {
  id: number;
  user: Partial<User>;
  assigned_to: number;
  related_ressource: string;
  entity: Partial<Entity>;
  issuer_team: Partial<Team>;
  departement: number;
  target_team: number;
  severity: TICKET_SEVERITY;
  last_update: string;
  status: TICKET_STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface IqueryParams {
  filter: Partial<Filter>;
  access_entity: number[];
  access_team: number[];
  sortOrder: string;
  sortField: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  read: number;
}

/**
 * `ChatState` is an object with the following properties: `loader`, `userNotFound`, `drawerState`,
 * `selectedSectionId`, `selectedTabIndex`, and `selectedUser`.
 * @property {boolean} loader - This is a boolean property that will be used to show/hide the loader.
 * @property {string} userNotFound - This is a string that will be used to display an error message if
 * the user is not found.
 * @property {boolean} drawerState - This is the state of the drawer.
 * @property {number} selectedSectionId - This is the id of the section that is currently selected.
 * @property {number} selectedTabIndex - This is the index of the tab that is currently selected.
 * @property selectedUser - This is the user that is currently selected in the chat list.
 */
export interface ChatState {
  loader: boolean;
  userNotFound: string;
  drawerState: boolean;
  selectedSectionId: number;
  selectedTabIndex: number;
  selectedTopic: null;
}

/**
 * Chat is a type that has a from property of type User, a to property of type User, a msg property of
 * type string, a createdAt property of type Date, and an updatedAt property of type Date.
 * @property {User} from - The user who sent the message
 * @property {User} to - The user that the message is being sent to.
 * @property {string} msg - The message that was sent
 * @property {Date} createdAt - The date and time when the chat was created.
 * @property {Date} updatedAt - The date and time when the chat was last updated.
 */
export interface ChatType {
  id: number;
  from: User;
  to: User;
  msg: string;
  read: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: number;
  from: User;
  to: User;
  status: TopicStatus;
  updatedby: User | null;
  subject: string;
  createdAt: Date;
  unreadMessages: number;
}

export enum TopicStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
}
