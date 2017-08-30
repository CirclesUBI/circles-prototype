import { User } from './user-interface';

export interface Organisation extends User {
  organisation:string;
  address?:string;
}
