import { Component } from '@angular/core';
import { Loading, LoadingController, ModalController, NavController, NavParams, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { NotificationsService } from 'angular2-notifications';
import 'rxjs/add/operator/debounceTime';

import { TransactionService } from '../../providers/transaction-service/transaction-service';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

import { ConfirmModal } from '../../pages/confirm-modal/confirm-modal';

@Component({
  selector: 'page-send',
  templateUrl: 'send.html',
})
export class SendPage {

  private sendForm: FormGroup;
  private toUser: User;
  private user: User;
  private userSub$: Subscription;

  private loading: Loading;
  private toast: Toast;

  private validatorTransfer: any;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private notificationsService: NotificationsService,
    private modalController: ModalController,
    private toastCtrl: ToastController,
    private transactionService: TransactionService,
    private userService: UserService,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {

    this.toUser = this.navParams.data.user;

    this.sendForm = this.formBuilder.group({
      toUserKey: [this.toUser.uid, Validators.required],
      amount: [null, Validators.required],
      message: [null]
    });
  }
  // tslint:disable-next-line:no-unused-variable
  private onSubmit(formData: any, formValid: boolean): void {

    if (!formValid)
      return;

    if (this.user.balance < formData.amount) {
      this.notificationsService.create('Send Fail', '', 'error');
      let msg = "You don't have enough Circles!";
      this.notificationsService.create('Balance', msg, 'warn');
      return;
    }

    let toUserName = this.userService.keyToUser(formData.toUserKey).displayName;
    let msg = "You are about to send "+formData.amount+" to "+toUserName;
    let conf = this.modalController.create(ConfirmModal, { title: 'Confirm Send', message: msg });
    conf.present();
    conf.onDidDismiss((confirm) => {
      if (confirm) {
        this.loading = this.loadingCtrl.create({
          content: 'Sending ...'
        });
        this.loading.present();
        console.log(this.user.uid,formData.toUserKey,formData.amount);
        this.transactionService.transfer(this.user.uid,formData.toUserKey,formData.amount).then(
          () => {
            this.toUser = null;
            this.sendForm.reset();
            this.loading.dismiss();
            this.navCtrl.pop();
          },
          (error) => {
            this.loading.dismiss();
          }
        );
      }
    });
  }

  ionViewDidLoad() {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error getting user: '+error,
          duration: 4000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      },
      () => console.log('send ionViewDidLoad userSub$ obs complete')
    );
  }

  ionViewWillUnload() {
    this.userSub$.unsubscribe();
  }

}
