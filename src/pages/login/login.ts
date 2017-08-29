import { Component } from '@angular/core';
import { Loading, LoadingController, NavController } from 'ionic-angular';

import * as firebase from 'firebase/app';

import { LoginEmailPage } from '../../pages/login-email/login-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';
import { AuthService } from '../../providers/auth-service/auth-service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loading: Loading;

  constructor(
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private authService: AuthService
  ) { }

  // tslint:disable-next-line:no-unused-variable
  private loginTwitter():void {
    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true
    });
    this.loading.present();
    var provider = new firebase.auth.TwitterAuthProvider();
    this.authService.signInRedirect(provider);
  }

  // tslint:disable-next-line:no-unused-variable
  private loginGithub():void {

    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true,
    });
    this.loading.present();

    var provider = new firebase.auth.GithubAuthProvider();
    this.authService.signInRedirect(provider);
  }

  // tslint:disable-next-line:no-unused-variable
  private loginFB():void {

    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true
    });
    this.loading.present();

    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('email');
    this.authService.signInRedirect(provider);
  }

  // tslint:disable-next-line:no-unused-variable
  private loginGoogle():void {
    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true
    });
    this.loading.present();
    var provider = new firebase.auth.GoogleAuthProvider();
    this.authService.signInRedirect(provider);
  }

  // tslint:disable-next-line:no-unused-variable
  private loginEmail():void {
    this.navCtrl.push(LoginEmailPage);
  }

  // tslint:disable-next-line:no-unused-variable
  private goSignup():void {
    this.navCtrl.push(SignupEmailPage);
  }

}
