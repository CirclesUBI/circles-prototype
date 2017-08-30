import { Injectable, OnDestroy } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

import { LogItem } from '../../interfaces/log-item-interface';

@Injectable()
export class TransactionService implements OnDestroy {

  public transact: Subject<any> = new Subject<any>();

  private user: User;
  private userSub$: Subscription;
  private transactionLog$: FirebaseListObservable<LogItem[]>;

  constructor(
    private db: AngularFireDatabase,
    private http: Http,
    private newsService: NewsService,
    private userService: UserService
  ) {

    this.userSub$ = this.userService.user$.subscribe(
      user => this.user = user,
      error => console.error(error),
      () => console.log('transaction-service constructor userSub$ obs complete')
    );
    this.transactionLog$ = this.db.list('/transactions/');
  }

  private logTransfer(toUserKey:string, amount:number):void {

    let logItem = {
      "from" : this.user.uid,
      "to" : toUserKey,
      "timestamp" : firebase.database['ServerValue']['TIMESTAMP'],
      "amount" : amount
    } as LogItem;
    //add to the main transaction log
    this.transactionLog$.push(logItem);
  }

  public transfer(fromUserKey,toUserKey,amount,message) {
    return this.postTransaction(fromUserKey,toUserKey,amount).map(
      (result) => {
        this.logTransfer(toUserKey,amount);
        this.newsService.addTransaction(toUserKey, amount, message);
        return result;
      }).first();
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
