import { Validator } from './validator-interface';
import { Coin } from './coin-interface';
import { Provider } from './provider-interface';

export interface User {
  $key: string,
  agreedToDisclaimer:boolean, //used for legal reasons, and to denote that the user has been fully set up
  authProviders: Array<string|Provider>;
  balance: number;
  createdAt: any;
  displayName: string;
  email: string;
  greeting?: string;
  profilePicURL: string;
  pushID: string;
  tradeMessage?:string;
  trustedUsers: Array<string|User>;
  uid: string;
  validators: Array<string|Validator>;
  wallet:{ [key: string]: Coin };
  website?: string;
}
