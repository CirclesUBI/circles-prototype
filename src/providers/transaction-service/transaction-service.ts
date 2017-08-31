import { Injectable, OnDestroy } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

@Injectable()
export class TransactionService implements OnDestroy {

  private user: User;
  private userSub$: Subscription;

  constructor(
    private http: Http,
    private userService: UserService
  ) {
    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => console.error(error),
      () => console.log('transaction-service constructor userSub$ obs complete')
    );
  }

  public transfer(fromUserKey,toUserKey,amount,validator) {
    if (validator) return this.postValidatorTransaction(fromUserKey,toUserKey,validator,amount);
    else return this.postTransaction(fromUserKey,toUserKey,amount);
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
