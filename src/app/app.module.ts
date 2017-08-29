//core
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { CirclesApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

//vendor
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { Ng2PicaModule } from 'ng2-pica';
import { SimpleNotificationsModule } from 'angular2-notifications';

//pages
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { SearchPage } from '../pages/search/search';
import { UserDetailPage } from '../pages/user-detail/user-detail';
import { ValidatorDetailPage } from '../pages/validator-detail/validator-detail';
import { LoginPage } from '../pages/login/login';
import { LoginEmailPage } from '../pages/login-email/login-email';
import { SignupEmailPage } from '../pages/signup-email/signup-email';
import { SendPage } from '../pages/send/send';
import { ApplyPage } from '../pages/apply/apply';
import { WelcomePage } from '../pages/welcome/welcome';
import { WalletPage } from '../pages/wallet/wallet';
import { SettingsPage } from '../pages/settings/settings';
import { ConfirmModal } from '../pages/confirm-modal/confirm-modal';
import { WaitModal } from '../pages/wait-modal/wait-modal';

//components
import { NewsCard } from '../components/news-card/news-card';
import { AutoresizeDirective } from '../directives/autoresize/autoresize';

//services
import { StorageService } from '../providers/storage-service/storage-service';
import { AuthService } from '../providers/auth-service/auth-service';
import { UserService } from '../providers/user-service/user-service';
import { TransactionService } from '../providers/transaction-service/transaction-service';
import { NewsService } from '../providers/news-service/news-service';
import { ValidatorService } from '../providers/validator-service/validator-service';

//configs
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    ApplyPage,
    AutoresizeDirective,
    CirclesApp,
    ConfirmModal,
    HomePage,
    LoginEmailPage,
    LoginPage,
    NewsCard,
    ProfilePage,
    SearchPage,
    SendPage,
    SettingsPage,
    SignupEmailPage,
    UserDetailPage,
    ValidatorDetailPage,
    WaitModal,
    WalletPage,
    WelcomePage
  ],
  imports: [
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(environment.firebase),
    BrowserAnimationsModule,
    BrowserModule,
    IonicModule.forRoot(CirclesApp,{
        scrollPadding: false,
        scrollAssist: true,
        autoFocusAssist: false,
        mode: 'ios'}), //this will force 'ios' style on all platforms
    Ng2PicaModule,
    SimpleNotificationsModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ApplyPage,
    CirclesApp,
    ConfirmModal,
    HomePage,
    LoginEmailPage,
    LoginPage,
    ProfilePage,
    SearchPage,
    SendPage,
    SettingsPage,
    SignupEmailPage,
    UserDetailPage,
    ValidatorDetailPage,
    WaitModal,
    WalletPage,
    WelcomePage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    NewsService,
    SplashScreen,
    StatusBar,
    StorageService,
    TransactionService,
    UserService,
    ValidatorService
  ]
})
export class AppModule {}
