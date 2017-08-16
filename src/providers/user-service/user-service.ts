import { Injectable, OnDestroy } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/find';
import 'rxjs/add/operator/map';

import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';

import { Coin } from '../../interfaces/coin-interface';
//import { Validator } from '../../interfaces/validator-interface';
import { NewsItem } from '../../interfaces/news-item-interface';

@Injectable()
export class UserService implements OnDestroy {

  public users: any;
  public type: string;

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
  private trustedUsers: any;

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
      },
      error => console.log('Could not load users.')
    );
  }

  public initialise(initUser) {

    if (!this.isOrg(initUser))
      this.type = 'individual';
    else
      this.type = 'organisation';

    this.userFirebaseObj$ = this.db.object('/users/' + initUser.uid + '/userData');
    this.userSub$ = this.userFirebaseObj$.subscribe(
      user => {
        this.user = user;
        this.setBalance(user);
        this.userSubject$.next(this.user);
      },
      error => console.log('Could not load current user record.')
    );

    this.combinedSub$  = Observable.combineLatest(this.userFirebaseObj$, this.usersFirebaseList$).subscribe(
      (result) => {
        let user = result[0];
        let users = result[1];

        if (!this.users) {
          this.users = [];
          for (let u of users) {
            this.users[u.$key] = u.userData;
          }
          this.usersSubject$.next(users);
        }

        if (user.trustedUsers) {
          this.trustedUsers = user.trustedUsers.map( (uKey:string) => this.keyToUser(uKey));
        }
      }
    );
  }

  public createCirclesUser(formUser): Individual | Organisation {

    formUser.createdAt = firebase.database['ServerValue']['TIMESTAMP'];
    if (!formUser.authProviders) {
      formUser.authProviders = ["email","name"];
    }
    else {
      formUser.authProviders.push("email");
      formUser.authProviders.push("name");
    }

    formUser.agreedToDisclaimer = false;

    if (!this.isOrg(formUser)) {
      formUser.displayName = formUser.firstName + ' ' + formUser.lastName;
      this.user = this.setInitialWallet(formUser);
    }
    else {
      this.user = formUser;
    }
    return this.user;
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

  private setInitialWallet(user:Individual): Individual {
    let now = new Date();
    let day = now.getDay();
    let diff = (7 - 5 + day) % 7;
    let b = this.weeklyGrant - ((this.weeklyGrant / 7) * (diff));
    this.myCoins.amount = Math.round(b);
    this.myCoins.owner = user.uid;
    this.myCoins.title = (user.firstName) ? user.firstName + ' Coin' : 'Circle Coin';
    //my coins start at the highest priority
    this.myCoins.priority = 0;
    this.myCoins.createdAt = now.getTime();
    this.allCoins = {
      [user.uid]: this.myCoins
    };
    user.wallet = this.allCoins;
    this.setBalance(user);
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
      let result = await this.userFirebaseObj$.update(updateObject);
      console.log('updateUser success');
    } catch (error) {
      console.error(error);
      throw new Error("userService updateUser fail");
    }
  }

  public async saveUser() {
    try {
      let result = await this.userFirebaseObj$.set(this.user);
      console.log('saveUser success');
    } catch (error) {
      console.error(error);
      throw new Error("userService saveUser fail");
    }
  }

  public isOrg(user: Individual | Organisation): user is Organisation {
    return (<Organisation>user).address !== undefined;
  }

  ngOnDestroy() {
    this.userSub$.unsubscribe();
    this.usersSub$.unsubscribe();
  }
}
