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
import { ValidatorService } from '../../providers/validator-service/validator-service';
import { AuthService } from '../../providers/auth-service/auth-service';

@Injectable()
export class UserService implements OnDestroy {

  public users: any;
  public validators: any;
  public type: string;

  public user$: Observable<User>;
  public userFirebaseObj$: FirebaseObjectObservable<User>;
  public usersFirebaseList$: FirebaseListObservable<any>;
  private usersSubject$: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public users$ = this.usersSubject$.asObservable();

  public user = {} as User;
  private userSubject$: ReplaySubject<User> = new ReplaySubject<User>(1);

  private combinedSub$: Subscription;

  public trustedUsersNetwork: Array<any> = [];
  public trustedByValidator: Array<any> = [];

  private userObsCallCount = 0;

  constructor(
    private db: AngularFireDatabase,
    private validatorService: ValidatorService,
    private authService: AuthService) {

    this.authService.authState$.subscribe(
      (auth) => {
        if (auth) {

          this.userObsCallCount = 0;
          this.userFirebaseObj$ = this.db.object('/users/' + auth.uid + '/userData');
          this.user$ = this.userSubject$.asObservable();
          this.usersFirebaseList$ = this.db.list('/users/');

          this.combinedSub$  = Observable.combineLatest(this.userFirebaseObj$, this.usersFirebaseList$).subscribe(
            (result) => {
              console.log('user-service combinedSub$ called:'+(++this.userObsCallCount));
              //store users
              let users = result[1];
              this.trustedUsersNetwork = [];
              this.users = [];
              for (let u of users) {
                this.users[u.$key] = u.userData;
              }

              let user = result[0] as any;
              if (!user.$exists() || !user.wallet) {
                console.log('user not ready');
                return;
              }

              if (!user.authProviders.includes('email')) {//} && auth.emailVerified) {
                user.authProviders.push('email');
              }

              if (!this.isOrg(user))
                this.type = 'individual';
              else
                this.type = 'organisation';

              //setup user
              this.user = user;
              this.user.coins = this.user.wallet.coins[this.user.uid];
              if (this.user.validators)
                this.validators = this.user.validators.map((valKey) => this.validatorService.keyToValidator(valKey));
              else
                this.validators = [];

              this.userSubject$.next(this.user);
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
              }
              if (user.trustedByValidators) {
                for (let valKey in user.trustedByValidators) {
                  user.trustedByValidators[valKey].map((userKey:string) => {
                    let u = Object.assign({}, this.keyToUser(userKey)) as any;
                    u.image = this.validatorService.keyToValidator(valKey).profilePicURL;
                    u.networkType = 'validator';
                    this.trustedUsersNetwork.push(u);
                  });
                }
              }
              this.authService.setLoggedInState(true);
            }
          );

        }
        else {
          this.user = null;
          this.authService.setLoggedInState(false);
          this.combinedSub$.unsubscribe();
        }
      }
    );
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

  public keyToUser(key: string): User {
    let u = this.users[key];
    if (!u)
      console.log('Error: missing user '+key);
    return u;
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

    if (this.user.trustedUsers) {
      if (this.user.trustedUsers.includes(userKey)) {
        console.error('user:'+userKey+' already trusted');
        return;
      }
      this.user.trustedUsers.push(userKey);
    }
    else
      this.user.trustedUsers = [userKey];

    return this.updateUser({trustedUsers:this.user.trustedUsers});
  }

  public removeTrustedUser(userKey) {
    if (!this.user.trustedUsers || !this.user.trustedUsers.includes(userKey)) {
      console.error('user:'+userKey+' not trusted');
      return;
    }
    this.user.trustedUsers = this.user.trustedUsers.filter(user => {
	     return user != userKey;
    });
    return this.updateUser({trustedUsers:this.user.trustedUsers});
  }

  public getUserSettings(uid) {
    return this.db.object('/users/'+uid+'/settings/');
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
    this.combinedSub$.unsubscribe();
  }
}
