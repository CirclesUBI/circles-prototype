import { Injectable, OnDestroy } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/find';
import 'rxjs/add/operator/map';

import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';

import { Coin } from '../../interfaces/coin-interface';

@Injectable()
export class UserService implements OnDestroy {

  public users: any;
  public type: string;
  public authProviders: Array<string>;

  public user$: Observable<User>;
  public userFirebaseObj$: FirebaseObjectObservable<User>;
  public usersFirebaseList$: FirebaseListObservable<any>;
  private usersSubject$: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public users$ = this.usersSubject$.asObservable();

  private user = {} as User;
  private userSubject$: ReplaySubject<User> = new ReplaySubject<User>(1);

  private userSub$: Subscription;
  private usersSub$: Subscription;
  private combinedSub$: Subscription;
  private weeklyGrant: number = 100;
  private myCoins: Coin = {} as Coin;
  private allCoins: { [key: string]: Coin };
  public trustedUsersNetwork: Array<any> = [];
  public trustedByValidator: Array<any> = [];

  constructor(private db: AngularFireDatabase) {

    this.user.createdAt = 0;
    this.user$ = this.userSubject$.asObservable();
    this.usersFirebaseList$ = this.db.list('/users/');
    this.usersSub$ = this.usersFirebaseList$.subscribe(
      users => {
        this.users = [];
        for (let u of users) {
          this.users[u.$key] = u.userData;
        }
        this.usersSubject$.next(users);
        this.usersSub$.unsubscribe();
      },
      error => console.log('Could not load users.')
    );
  }

  public initialise(authProviders, initUser) {

    this.authProviders = authProviders.map(
      (provider) => {
        return provider.providerId.split('.')[0];
      }
    );
    this.authProviders = this.authProviders.concat(initUser.authProviders).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });

    if (!this.isOrg(initUser))
      this.type = 'individual';
    else
      this.type = 'organisation';

    this.userFirebaseObj$ = this.db.object('/users/' + initUser.uid + '/userData');
    this.userSub$ = this.userFirebaseObj$.subscribe(
      user => {
        this.user = user;
        this.user.authProviders = this.authProviders;
        //this.setBalance(user);
        this.userSubject$.next(this.user);
      },
      error => console.log('Could not load current user record.')
    );

    this.combinedSub$  = Observable.combineLatest(this.userFirebaseObj$, this.usersFirebaseList$).subscribe(
      (result) => {

        let user = result[0];
        let users = result[1];
        this.trustedUsersNetwork = [];
        this.users = [];
        for (let u of users) {
          this.users[u.$key] = u.userData;
        }
        this.usersSubject$.next(users);
        if (user.trustedUsers || user.trustedBy) {
          let tToUsers = (user.trustedUsers) ? user.trustedUsers.slice(0) : [];
          let tByUsers = (user.trustedBy) ? user.trustedBy.slice(0) : [];
          tToUsers =  tToUsers.filter(
            (tUser:string) => {
              let found = false;
              tByUsers = tByUsers.filter(
                (tByUser:string) => {
                  if (tByUser === tUser) {
                    let u = Object.assign({}, this.keyToUser(tByUser)) as any;
                    u.icon = "checkmark-circle";
                    u.networkType = 'direct';
                    this.trustedUsersNetwork.push(u);
                    found = true;
                    return false;
                  }
                  return true;
                }
              );
              return !found;
            }
          );
          tToUsers.map((tUserKey:string) => {
            let u = Object.assign({}, this.keyToUser(tUserKey)) as any;
            u.icon = "arrow-dropleft-circle";
            u.networkType = 'direct';
            this.trustedUsersNetwork.push(u);
          });
          tByUsers.map((tUserKey:string) => {
            let u = Object.assign({}, this.keyToUser(tUserKey)) as any;
            u.icon = "arrow-dropright-circle";
            u.networkType = 'direct';
            this.trustedUsersNetwork.push(u);
          });
          this.trustedUsersNetwork = this.trustedUsersNetwork.concat(this.trustedByValidator);
        }
      }
    );
  }

  public addValidatorUsers(users:Array<User>) {
    this.trustedByValidator = users;
    this.trustedUsersNetwork = this.trustedUsersNetwork.concat(this.trustedByValidator);
  }

  public createCirclesUser(type,authUser,formUser) {

    if (type == 'organisation') {
      formUser.organisation = formUser.displayName;
    }
    else {
      formUser.firstName = formUser.firstName.charAt(0).toUpperCase() + formUser.firstName.slice(1).toLowerCase();
      formUser.lastName = formUser.lastName.charAt(0).toUpperCase() + formUser.lastName.slice(1).toLowerCase();
      formUser.displayName = formUser.firstName+' '+formUser.lastName;
    }

    formUser.createdAt = firebase.database['ServerValue']['TIMESTAMP'];

    let providers = ['name'];
    if (formUser.email === authUser.email && authUser.emailVerified) {
      providers.push('email');
    }
    if (formUser.profilePicURL) {
      providers.push('photo');
    }
    else {
      formUser.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2FGeneric_Image_Missing-Profile.jpg?alt=media&token=f1f08984-69f3-4f25-b505-17358b437d7a";
    }
    //providers.push(authUser.providerData[0].providerId);
    formUser.authProviders = providers;
    formUser.agreedToDisclaimer = false;

    this.user = this.setInitialWallet(formUser);
    return this.user;
  }

  public sendAndWaitEmailVerification(waitModal) {
    return new Promise((resolve, reject) => {
      let interval=null;
      let user = firebase.auth().currentUser;
      user.sendEmailVerification().then(
        () => {
          if (waitModal) waitModal.present();
          interval = setInterval(
            () => {
              user.reload().then(
                () => {
                  if (interval && user.emailVerified) {
                    clearInterval(interval);
                    interval=null;
                    resolve(user);
                  }
                },
                error => {
                  if (interval) {
                    clearInterval(interval);
                    interval=null;
                    console.log('sendAndWaitEmailVerification: reload failed ! '+error);
                    reject(error);
                  }
                }
              );
            }, 1000);
        },
        error => {
          console.log('sendAndWaitEmailVerification: sendEmailVerification failed ! '+error);
          reject(error);
        }
      );
    });
  }

  public keyToUser$(key: string): Observable<User> {
    return this.users$.map(
      users => users.find(user => user.uid === key).userData
    );
  }

  public keyToUser(key: string): User {
    let u = this.users[key];
    if (!u)
      console.log('Error: missing user '+key);
    return u;
  }

  public keyToUserName$(key: string): Observable<string> {
    return this.users$.map(users => {
      let u = users.find(user => user.uid === key);
      return u.displayName;
    });
  }

  public keyToUserName(key: string): string {
    let d = this.users[key];
    if (!d)
      console.log('Error: missing user '+key);
    return d.displayName;
  }

  public filterUsers$(searchTerm: string) {
    //if (!searchTerm)
    //  return Observable.empty(); //todo: should this return an observable(false) or something?
    return this.users$.map((users) => {
      users = users.map((userRecord) => {
        return userRecord.userData;
      });

      let ret = users.filter((user) => {
        //let user = userRecord.userData as User;
        if (!user || !user.displayName || user.displayName == '' || user.uid == 'undefined' || (user.uid == this.user.uid))
          return false;
        let s = searchTerm.toLowerCase();
        let d = user.displayName.toLowerCase();
        return d.indexOf(s) > -1;
      });
      return ret;
    });
  }

  public addTrustedUser(userKey) {
    if (this.user.trustedUsers)
      this.user.trustedUsers.push(userKey);
    else
      this.user.trustedUsers = [userKey];

    this.updateUser({trustedUsers:this.user.trustedUsers});
  }

  public removeTrustedUser(userKey) {
    this.user.trustedUsers = this.user.trustedUsers.filter(user => {
	     return user != userKey;
    });
    this.updateUser({trustedUsers:this.user.trustedUsers});
  }

  private setInitialWallet(user:Individual | Organisation): Individual | Organisation {

    let now = new Date();
    this.myCoins.amount = 0;
    this.myCoins.owner = user.uid;
    debugger;
    if (this.isOrg(user)) {
      this.myCoins.title = 'Circles';
    }
    else {
      this.myCoins.title = user.firstName + 'Coin';
    }
    this.myCoins.priority = 0;
    this.myCoins.createdAt = now.getTime();
    this.allCoins = {
      [user.uid]: this.myCoins
    };
    user.wallet = this.allCoins;
    user.balance = 0;
    return user;
  }

  public setBalance(user:User): void {
    let total = 0;
    for (let i in user.wallet) {
      total += user.wallet[i].amount;
    }
    user.balance = total;
  }

  public signOut() {
    //todo: better way to do this?
    if (this.userSub$)
      this.userSub$.unsubscribe();

    if (this.usersSub$)
      this.usersSub$.unsubscribe();

    if (this.combinedSub$)
      this.combinedSub$.unsubscribe();
  }

  private clearUser() {
    let blankUser = {} as User;
    this.user = blankUser;
    // if (this.userSubject$) {
    //   this.userSubject$.next(blankUser);
    // }
  }

  public async updateUser(updateObject: Object) {
    try {
      await this.userFirebaseObj$.update(updateObject);
      console.log('updateUser success');
    } catch (error) {
      console.error(error);
      throw new Error("userService updateUser fail");
    }
  }

  public async saveUser() {
    try {
      await this.userFirebaseObj$.set(this.user);
      console.log('saveUser success');
    } catch (error) {
      console.error(error);
      throw new Error("userService saveUser fail");
    }
  }

  public isOrg(user: Individual | Organisation): user is Organisation {
    return (<Organisation>user).organisation !== undefined;
  }

  ngOnDestroy() {
    this.userSub$.unsubscribe();
    this.usersSub$.unsubscribe();
  }
}
