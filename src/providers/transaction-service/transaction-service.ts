import { Injectable, OnDestroy } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

import { LogItem } from '../../interfaces/log-item-interface';

@Injectable()
export class TransactionService implements OnDestroy {

  private user: User;
  private userSub$: Subscription;
  private transactionLog$: FirebaseListObservable<LogItem[]>;

  constructor(
    private db: AngularFireDatabase,
    private http: Http,
    private userService: UserService
  ) {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => console.error(error),
      () => console.log('transaction-service constructor userSub$ obs complete')
    );
    this.transactionLog$ = this.db.list('/transactions/');
  }

  public transfer(fromUserKey,toUserKey,amount,message) {
    return this.postTransaction(fromUserKey,toUserKey,amount);
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

  ngOnDestroy() {
    this.userSub$.unsubscribe();
  }
}
