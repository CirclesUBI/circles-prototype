import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user-service/user-service';

import { User } from '../../interfaces/user-interface';

import { ApplyPage } from '../../pages/apply/apply';

import { Validator } from '../../interfaces/validator-interface';
import { ValidatorService } from '../../providers/validator-service/validator-service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-validator-detail',
  templateUrl: 'validator-detail.html',
})
export class ValidatorDetailPage {

  private user: User;
  private validator: Validator = {} as Validator;
  private userSub$: Subscription;
  private trusted: boolean = false;
  private applied: boolean = false;

  private trustedUsers: Array<User>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,

    private validatorService: ValidatorService
  ) {
    this.validator = navParams.data;
  }

  // tslint:disable-next-line:no-unused-variable
  private revokeTrust() {
    this.validator.trustedUsers.filter(
      user => user !== this.user.uid
    );
    this.trusted = false;
    this.validatorService.revokeValidation(this.user,this.validator);
  }

  // tslint:disable-next-line:no-unused-variable
  private checkRequirements() {
    let rqs = this.validatorService.getValidatorRequirements(this.validator, this.user);
    this.navCtrl.push(ApplyPage, {validator:this.validator, user:this.user, reqs: rqs});
  }

  ionViewDidLoad() {
    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        this.trustedUsers = [];
        this.trusted = false;
        this.applied = false;
        if (this.user.validators) {
          for (let vKey of this.user.validators) {
            if (this.validator.$key == vKey)
              this.trusted = true;
          }
        }
        if (this.validator.trustedUsers) {
          for (let tUserKey of this.validator.trustedUsers) {
            let u = this.userService.users[tUserKey];
            if (u)
              this.trustedUsers.push(u);
          }
        }
        if (this.validator.appliedUsers) {
          if (this.validator.appliedUsers.find(u => u === this.user.uid)) {
            this.applied = true;
          }
        }
      }
    );
  }

}
