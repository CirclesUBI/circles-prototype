import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, ModalController, NavController, NavParams, Toast, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormControl, Validators, } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
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

    this.toUser = navParams.data;

    this.sendForm = formBuilder.group({
      toUserKey: [this.toUser.uid, Validators.required],
      amount: [null, Validators.required],
      message: [null]
    });
  }

  private onSubmit(formData: any, formValid: boolean): void {

    if (!formValid)
      return;

    if (this.user.balance < formData.amount) {
      this.notificationsService.create('Send Fail', '', 'error');
      let msg = "You don't have enough Circles!";
      this.notificationsService.create('Balance', msg, 'warn');
      return;
    }

    let toUserName = this.userService.keyToUserName(formData.toUserKey);
    let msg = "You are about to send "+formData.amount+" to "+toUserName;
    let conf = this.modalController.create(ConfirmModal, { title: 'Confirm Send', message: msg });
    conf.present();
    conf.onDidDismiss((confirm) => {
      if (confirm) {
        this.loading = this.loadingCtrl.create({
          content: 'Sending ...'
        });
        this.loading.present();
        if (this.transactionService.createTransactionIntent(formData.toUserKey, formData.amount, formData.message)) {
          //reset the recipient field
          this.toUser = null;
          this.sendForm.reset();
          this.userService.saveUser();
          this.loading.dismiss();
          this.navCtrl.pop();
        }
        else {
          this.loading.dismiss();
          this.navCtrl.pop()
        }
      }
    });
  }

  ionViewDidLoad() {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error getting user: '+error,
          duration: 2500,
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
