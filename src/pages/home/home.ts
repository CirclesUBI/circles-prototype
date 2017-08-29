import { Component } from '@angular/core';
import { NavController, NavParams, Toast, ToastController } from 'ionic-angular';
import { NotificationsService } from 'angular2-notifications';

import { DomSanitizer } from '@angular/platform-browser';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';
import { ValidatorService } from '../../providers/validator-service/validator-service';
import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';

import { SearchPage } from '../search/search';
import { UserDetailPage } from '../user-detail/user-detail';
import { ValidatorDetailPage } from '../validator-detail/validator-detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  private toast: Toast;
  private base64ImageData: string;
  private user: User;
  private userSub$: Subscription;

  private selectedView: string = 'network';
  private view: string = 'network';

  private networkList: Array<any> = [];
  private newsList: Array<any> = [];
  private validatorList: Array<any> = [];

  private myCoinBalance: number;
  private allCoinBalance: number;
  private myCoinName: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private notificationsService: NotificationsService,
    private db: AngularFireDatabase,
    private ds: DomSanitizer,
    private toastCtrl: ToastController,
    private userService: UserService,
    private newsService: NewsService,
    private validatorService: ValidatorService
  ) { }

  private openSearch(): void {
    console.log("clicked openSearch");
    this.navCtrl.push(SearchPage);
  }

  private goToUserDetail(user): void {
    this.navCtrl.push(UserDetailPage, user);
  }

  private goToValidatorDetail(validator): void {
    this.navCtrl.push(ValidatorDetailPage, validator);
  }

  private selectNetwork(): void {
    this.selectedView = 'network';
  }

  private selectNews(): void {
    this.selectedView = 'news';
  }

  private selectValidators(): void {
    this.selectedView = 'validators';
  }

  ionViewDidLoad() {

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        if (!user.agreedToDisclaimer) {
          //if they got this far then they have agreed to the disclaimer
          this.userService.updateUser({agreedToDisclaimer:true});
        }

        if (this.userService.type === 'organisation') {
          this.user = user as Organisation;
        }
        else {
          this.user = user as Individual;
          this.myCoinName = user.wallet[user.uid].title;
          this.myCoinBalance = user.wallet[user.uid].amount;
          this.allCoinBalance = user.balance;
        }      
      }
    );
  }
}
