import { Component } from '@angular/core';
import { Loading, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';

import { ValidatorService } from '../../providers/validator-service/validator-service';
import { Validator } from '../../interfaces/validator-interface'
import { User } from '../../interfaces/user-interface';
import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';


import { ConfirmModal } from '../../pages/confirm-modal/confirm-modal';

@Component({
  selector: 'page-apply',
  templateUrl: 'apply.html',
})
export class ApplyPage {

  private validator: Validator = {} as Validator;
  private user: User = {} as User;
  private applied: boolean = false;
  private requirements: Array<any>;
  private loading: Loading;
  private allRequirementsMet: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private validatorService: ValidatorService,
    private newsService: NewsService
  ) {
    this.validator = navParams.get('validator');
    this.user = navParams.get('user');
    this.requirements = navParams.get('reqs');
    for (let r of this.requirements) {
      if (!r.completed)
        this.allRequirementsMet = false;
    }
    if (this.validator.appliedUsers) {
      for (let key of this.validator.appliedUsers) {
        if (this.user.uid == key)
          this.applied = true;
      }
    }
  }

  private apply() {
    let msg = "You are about to apply for validation from  "+this.validator.displayName;
    let conf = this.modalController.create(ConfirmModal, { title: 'Confirm Apply', message: msg });
    conf.present();
    conf.onDidDismiss((confirm) => {

      if (confirm) {
        this.loading = this.loadingCtrl.create({
          content: 'Applying ...'
        });
        this.loading.present();

        this.validatorService.applyForValidation(this.user, this.validator);
        this.newsService.addValidatorTrustRequest(this.validator);
        if (this.validator.autoAccept) {
          setTimeout(() => {
            this.validatorService.completeValidation(this.user, this.validator);
            this.newsService.addValidatorTrustAccept(this.validator);
            this.userService.saveUser();
            this.validatorService.saveValidator(this.validator);
            this.loading.dismiss();
            this.navCtrl.pop();
          }, 2000);
        }
        else {
          this.loading.dismiss();
          this.navCtrl.pop();
        }
        this.userService.saveUser();
        this.validatorService.saveValidator(this.validator);
      }
      else {
        this.loading.dismiss();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ApplyPage');
  }

}
