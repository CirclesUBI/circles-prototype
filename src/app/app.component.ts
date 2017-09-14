import { Component, ViewChild } from '@angular/core';
import { Loading, LoadingController, Platform, Toast, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireDatabase } from 'angularfire2/database';

import { AuthService } from '../providers/auth-service/auth-service';
import { UserService } from '../providers/user-service/user-service';
import { NewsService } from '../providers/news-service/news-service';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { WalletPage } from '../pages/wallet/wallet';
import { SettingsPage } from '../pages/settings/settings';
import { ProfilePage } from '../pages/profile/profile';
import { WelcomePage } from '../pages/welcome/welcome';

@Component({
  templateUrl: 'app.html'
})
export class CirclesApp {
  rootPage: any = LoginPage;
  @ViewChild('content') nav;

  private loading: Loading;
  private toast: Toast;
  private isInApp: boolean = false;
  private user: any;

  constructor(
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

      // Take a look at the query params.  If they exist, override the values from storage
      console.log('Segments', this.nav._linker.segments);
      if (this.nav._linker.segments && this.nav._linker.segments[0]) {
        let split = this.nav._linker.segments[0].id.split('\/');
        console.log('Split', split);
      }

      if (this.platform.is('cordova')) {

      }
      statusBar.styleDefault();
      this.authService.authState$.subscribe(
        (auth) => {
          if (auth) {
            console.log('login',auth.uid);

            this.loading = this.loadingCtrl.create({
              content: 'Logging in ...',
              dismissOnPageChange: true
            });
            this.loading.present();

            let authUserObs$ = this.db.object('/users/' + auth.uid);
            let authUserSub$ = authUserObs$.subscribe(
              user => {
                this.user = user.userData;
                if (!user.$exists()) {
                  this.nav.push(WelcomePage, { authUser: auth });
                }
                else {
                  authUserSub$.unsubscribe();
                  let loggedSub = this.authService.loggedInState$.subscribe( (isLoggedIn) => {
                    if (isLoggedIn) {
                      loggedSub.unsubscribe();
                      this.isInApp = true;
                      this.nav.setRoot(HomePage);
                    }
                  });
                }
              },
              error => {
                this.toast = this.toastCtrl.create({
                  message: 'Error saving user: ' + error,
                  duration: 4000,
                  position: 'middle'
                });
                console.error(error);
                this.toast.present();
              });
          }
          else {
            this.nav.setRoot(LoginPage);
            //todo: hacky, this needs to fire on menu animation end
            setTimeout( () => {
              this.isInApp = false;
            },500);
          }
        },
        (error) => {
          this.toast = this.toastCtrl.create({
            message: 'User auth error: ' + error,
            duration: 4000,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
        },
        () => {}
      );
    });
  }

  // tslint:disable-next-line:no-unused-variable
  private goToWallet(): void {
    this.nav.push(WalletPage);
  }

  // tslint:disable-next-line:no-unused-variable
  private goToSettings(): void {
    this.nav.push(SettingsPage, {user:this.user});
  }

  // tslint:disable-next-line:no-unused-variable
  private goToProfile(): void {
    this.nav.push(ProfilePage);
  }

  // tslint:disable-next-line:no-unused-variable
  private logout(): void {
    this.authService.signOut();
  }
}
