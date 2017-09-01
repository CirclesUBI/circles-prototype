import { Injectable, OnDestroy } from '@angular/core';
import { Toast, ToastController } from 'ionic-angular';
import { Headers, Http } from '@angular/http';

import { NotificationsService  } from 'angular2-notifications';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

@Injectable()
export class TransactionService implements OnDestroy {

  private user: User;
  private userSub$: Subscription;
  private toast: Toast;

  constructor(
    private http: Http,
    private notificationsService: NotificationsService,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {
    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => console.error(error),
      () => console.log('transaction-service constructor userSub$ obs complete')
    );
  }

  public transfer(fromUserKey,toUserKey,amount,validator) {
    return new Promise ((resolve,reject) => {
      if (validator) {
        this.postValidatorTransaction(fromUserKey,toUserKey,validator,amount).subscribe(
          (res:any) => {
            let result = JSON.parse(res._body);
            debugger;
            if (!result.complete) {
              this.notificationsService.create('Send Fail', '', 'error');
              this.notificationsService.create('Error', result.message, 'warn');
              reject();
            }
            else {
              this.notificationsService.create('Send Success', '', 'success');              
              this.notificationsService.create('Sent', result.message, 'warn');
              resolve();
            }
          },
          (error) => {
            this.toast = this.toastCtrl.create({
              message: 'Error sending circles: '+error,
              duration: 4000,
              position: 'middle'
            });
            console.error(error);
            this.toast.present();
            return;
          }
        );
      }
      else {
        this.postTransaction(fromUserKey,toUserKey,amount).subscribe(
          (res:any) => {
            let result = JSON.parse(res._body);
            if (!result.complete) {
              this.notificationsService.create('Send Fail', '', 'error');
              this.notificationsService.create('Send', result.message, 'warn');
              reject();
            }
            else {
              this.notificationsService.create('Send Success', '', 'success');
              resolve();
            }
            return;
          },
          (error) => {
            this.toast = this.toastCtrl.create({
              message: 'Error sending circles: '+error,
              duration: 4000,
              position: 'middle'
            });
            console.error(error);
            this.toast.present();
            return;
          }
        );
      }
    });
  }

  private postTransaction(fromUserKey,toUserKey,amount) {
    let url = 'https://us-central1-circles-testnet.cloudfunctions.net/transfer';
    let data = {
      fromUser:fromUserKey,
      toUser:toUserKey,
      amount:amount
    };
    const body = JSON.stringify(data);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    return this.http.post(url,body,{headers: headers});
  }

  private postValidatorTransaction(fromUserKey,toUserKey,validatorKey,amount) {
    let url = 'https://us-central1-circles-testnet.cloudfunctions.net/validatorTransfer';
    let data = {
      fromUser:fromUserKey,
      toUser:toUserKey,
      validator:validatorKey,
      amount:amount
    };
    const body = JSON.stringify(data);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    return this.http.post(url,body,{headers: headers});
  }

  ngOnDestroy() {
    this.userSub$.unsubscribe();
  }
}
