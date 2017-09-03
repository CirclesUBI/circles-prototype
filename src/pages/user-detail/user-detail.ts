import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';
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
  private validatorTrusted: boolean = false;
  private trusted: boolean = false;
  private validatedBy: Validator = {} as Validator;
  private validatedByKey: string;

  private profilePicURL: string;

  constructor(
    private navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,
    private newsService: NewsService,
    private validatorService: ValidatorService
  ) {
    this.viewUser = navParams.data;
  }

  // tslint:disable-next-line:no-unused-variable
  private revokeTrust() {
    this.userService.removeTrustedUser(this.viewUser.uid);
  }

  // tslint:disable-next-line:no-unused-variable
  private affordTrust() {
    this.userService.addTrustedUser(this.viewUser.uid);
  }

  // tslint:disable-next-line:no-unused-variable
  private sendCircles () {
    if (this.validatedBy)
      this.sendCirclesViaValidator();
    else
      this.navCtrl.push(SendPage, {user:this.viewUser, val:false});
  }

  private sendCirclesViaValidator () {
    this.navCtrl.push(SendPage, {user:this.viewUser, val:this.validatedByKey});
  }

  ionViewDidLoad() {
    this.userSub$ = this.userService.user$.subscribe(
      (user) => {
        console.log('user-detail userSub$');
        this.user = user;
        if (this.viewUser.profilePicURL)
          this.profilePicURL = this.viewUser.profilePicURL;

        if (this.viewUser.trustedUsers) {
          this.trusted = this.trustFrom = this.viewUser.trustedUsers.some(tUserKey => {
            return tUserKey == this.user.uid;
          });
        }
        if (this.viewUser.trustedBy) {
          this.trusted = this.trustTo = this.viewUser.trustedBy.some(tUserKey => {
            return tUserKey == this.user.uid;
          });
        }
        if (this.user.validators && this.viewUser.validators) {
          this.user.validators.map( (valKey:string) => {
             this.trusted = this.validatorTrusted = this.viewUser.validators.some( tUserValKey => {
               if (tUserValKey == valKey) {
                this.validatedBy = this.validatorService.keyToValidator(valKey);
                this.validatedByKey = valKey;
                return true;
              }
             });
          });
        }
      }
    );
  }
}
