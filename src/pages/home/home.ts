import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';
// tslint:disable-next-line:no-unused-variable
import { NewsService } from '../../providers/news-service/news-service';
// tslint:disable-next-line:no-unused-variable
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
  host: {
        '(window:scroll)': 'updateHeader($event)'
    }
})
export class HomePage {

  private user: User;
  private userSub$: Subscription;

  private selectedView: string = 'network';

  private myCoinBalance: number;
  private allCoinBalance: number;
  private myCoinName: string;

  constructor(
    public navCtrl: NavController,
    private userService: UserService,
    private newsService: NewsService,
    private validatorService: ValidatorService
  ) { }

  // tslint:disable-next-line:no-unused-variable
  private openSearch(): void {
    this.navCtrl.push(SearchPage);
  }

  // tslint:disable-next-line:no-unused-variable
  private goToUserDetail(user): void {
    this.navCtrl.push(UserDetailPage, user);
  }

  // tslint:disable-next-line:no-unused-variable
  private goToValidatorDetail(validator): void {
    this.navCtrl.push(ValidatorDetailPage, validator);
  }

  // tslint:disable-next-line:no-unused-variable
  private selectNetwork(): void {
    this.selectedView = 'network';
  }

  // tslint:disable-next-line:no-unused-variable
  private selectNews(): void {
    this.selectedView = 'news';
  }

  // tslint:disable-next-line:no-unused-variable
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

  private onScrollList(e:Event):void {
    console.log("scrolled");
    console.log(e);
  }

  currPos = 0;
  updateHeader(evt) {
    this.currPos = (window.pageYOffset || evt.target.scrollTop)-(evt.target.clientTop || 0);
    console.log(this.currPos);
  }

}
