import { Component, ViewChild } from '@angular/core';
import { Loading, LoadingController, Platform, Toast, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../providers/auth-service/auth-service';
import { UserService } from '../providers/user-service/user-service';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';

import { WalletPage } from '../pages/wallet/wallet';
import { SettingsPage } from '../pages/settings/settings';
import { ProfilePage } from '../pages/profile/profile';
import { WelcomePage } from '../pages/welcome/welcome';

var authUserObs$: FirebaseObjectObservable<any>;

@Component({
  templateUrl: 'app.html'
})
export class CirclesApp {
  rootPage: any = LoginPage;
  @ViewChild('content') nav;

  private loading: Loading;
  private toast: Toast;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private toastCtrl: ToastController,
    private userService: UserService,
  ) {
    platform.ready().then(() => {

      if (this.platform.is('cordova')) {

      }
      statusBar.styleDefault();
      this.userService.authState$.subscribe(
        auth => {
          if (auth) {
            let authUserObs$ = this.db.object('/users/' + auth.uid);
            let authUserSub$ = authUserObs$.subscribe(
              user => {
                if (!user.$exists()) {
                  this.nav.push(WelcomePage, { authUser: auth, obs: authUserObs$ });
                }
                else {
                  authUserSub$.unsubscribe();
                  this.userService.initUserSubject$.next(user.userData);
                  this.nav.setRoot(HomePage);
                }
              },
              error => {
                this.toast = this.toastCtrl.create({
                  message: 'Error saving user: ' + error,
                  duration: 2500,
                  position: 'middle'
                });
                console.error(error);
                this.toast.present();
              });
          }
          else {
            this.nav.setRoot(LoginPage);
          }
        },
        error => {
          this.toast = this.toastCtrl.create({
            message: 'User auth error: ' + error,
            duration: 2500,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
        },
        () => { }
      );
    });
  }

  private goToWallet(): void {
    this.nav.push(WalletPage);
  }

  private goToSettings(): void {
    this.nav.push(SettingsPage);
  }

  private goToProfile(): void {
    this.nav.push(ProfilePage);
  }

  private logout(): void {
    this.authService.signOut();
  }
}
