export interface Validator {
  $key: string,
  appliedUsers: Array<string>;
  autoAccept: true;
  description: string;
  displayName: string;
  trustedUsers: Array<string>;
  profilePicURL: string;
  requirements: Array<string>;  
}
