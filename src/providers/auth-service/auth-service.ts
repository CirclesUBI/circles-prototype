import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { AngularFireAuth } from 'angularfire2/auth';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class AuthService {

  public authState$: any;
  public loggedInState$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private wasLoggedIn: boolean = false;

  constructor(
    private afAuth: AngularFireAuth
  ) {
    this.authState$ = this.afAuth.authState;
  }

  public createAuthUser(email:string, password:string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  public signInEmail(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  public signInRedirect(provider) {
    return this.afAuth.auth.signInWithRedirect(provider);
  }

  public linkRedirect(provider) {
    return this.afAuth.auth.currentUser.linkWithRedirect(provider);
  }

  public linkPopup(provider) {
    return this.afAuth.auth.currentUser.linkWithPopup(provider);
  }

  public setLoggedInState(isLoggedIn:boolean) {
    if (this.wasLoggedIn != isLoggedIn) {
      this.wasLoggedIn = isLoggedIn;
      this.loggedInState$.next(isLoggedIn);
    }
  }

  signOut() {
    // this.newsService.signOut();
    // this.validatorService.signOut();

    this.afAuth.auth.signOut().then(
      (user) => {
        console.log('logout success');
        //this.nav.setRoot(LoginPage);
      }, function(error) {
        console.log('logout fail:', error);
      });
  }
}
