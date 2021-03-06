export interface User {
  $key: string,
  agreedToDisclaimer:boolean, //used for legal reasons, and to denote that the user has been fully set up
  authProviders: Array<string>;
  balance: number;
  coins:any; //ref to my own coins - wallet[user.uid];
  createdAt: any;
  displayName: string;
  email: string;
  greeting?: string;
  profilePicURL: string;
  pushID: string;
  tradeMessage?:string;
  trustedBy: Array<string>;
  trustedUsers: Array<string>;
  trustedByValidators: any;
  uid: string;
  validators: Array<string>;
  wallet:any;
  website?: string;
}
