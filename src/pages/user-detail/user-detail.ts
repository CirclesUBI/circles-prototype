import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';
import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { ValidatorService } from '../../providers/validator-service/validator-service';
import { User } from '../../interfaces/user-interface';
import { Validator } from '../../interfaces/validator-interface';

import { Subscription } from 'rxjs/Subscription';

import { SendPage } from '../send/send';

@Component({
  selector: 'page-user-detail',
  templateUrl: 'user-detail.html',
})
export class UserDetailPage {

  private user: User = {} as User;
  private viewUser: User;
  private userSub$: Subscription;
  private trustTo: boolean = false;
  private trustFrom: boolean = false;
  private validatorTrust: boolean = false;
  private trusted: boolean = false;
  private validatedBy: Validator = {} as Validator;

  private profilePicURL: string;

  constructor(
    private navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,
    private newsService: NewsService,
    private transactionService: TransactionService,
    private validatorService: ValidatorService
  ) {
    this.viewUser = navParams.data;
    console.log(navParams.data);
  }

  private revokeTrust() {
    this.newsService.revokeUserTrust(this.viewUser);
    this.userService.removeTrustedUser(this.viewUser.uid);
  }

  private affordTrust() {
    this.newsService.addTrust(this.viewUser);
    this.userService.addTrustedUser(this.viewUser.uid);
  }

  private sendCircles () {
    this.navCtrl.push(SendPage, this.viewUser);
  }

  ionViewDidLoad() {
    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        if (this.viewUser.profilePicURL)
          this.profilePicURL = this.viewUser.profilePicURL;
        if (this.user.trustedUsers) {
          this.trustTo = this.user.trustedUsers.some(tUserKey => {
            return tUserKey == this.viewUser.uid;
          });
        }
        if (this.viewUser.trustedUsers) {
          this.trusted = this.trustFrom = this.viewUser.trustedUsers.some(tUserKey => {
            return tUserKey == this.user.uid;
          });
        }
      }
    );
  }
}
