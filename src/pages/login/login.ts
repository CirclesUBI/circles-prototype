import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavParams, NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
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
  private loading2: Loading;

  constructor(
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private authService: AuthService
  ) { }

  private loginFB():void {

    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true,
    });
    this.loading.present();

    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('email');

    this.authService.signInRedirect(provider);
  }

  private loginGoogle():void {
    this.loading = this.loadingCtrl.create({
      content: 'Logging in ...',
      dismissOnPageChange: true
    });
    var provider = new firebase.auth.GoogleAuthProvider();
    this.authService.signInRedirect(provider);
  }

  private loginEmail():void {
    this.navCtrl.push(LoginEmailPage);
  }

  private goSignup():void {
    this.navCtrl.push(SignupEmailPage);
  }

}
