import { Injectable, OnDestroy } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

import { NewsService } from '../../providers/news-service/news-service';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { NewsItem } from '../../interfaces/news-item-interface';
import { LogItem } from '../../interfaces/log-item-interface';

@Injectable()
export class TransactionService implements OnDestroy {

  public transact: Subject<any> = new Subject<any>();

  private user: User;
  private userSub$: Subscription;
  private transactionLog$: FirebaseListObservable<LogItem[]>;

  constructor(
    private db: AngularFireDatabase,
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

  private  async transfer(toUser:User, amount:number) {

    amount = Number(amount);
    let sentCoins = [];

    let trusted = this.getTrustIntersection(this.user, toUser);
    if (trusted.balance < amount) {
      //we don't have enough trusted coins
      return false;
    }
    for (let coin of trusted.trustedCoins) {
      if (amount > coin.amount) {
        let c = Object.assign({}, coin);;
        sentCoins[coin.owner] = c;
        coin.amount = 0;
      }
      else {
        let c = Object.assign({}, coin);
        c.amount = amount;
        sentCoins[coin.owner] = c;
        coin.amount -= amount;
      }
    }
    this.user.balance -= amount;

    //now we need to update the other wallet
    toUser.balance += amount;
    for (let key in sentCoins) {
      if (toUser.wallet[key]) {
        toUser.wallet[key].amount += sentCoins[key].amount;
      }
      else {
        toUser.wallet[key] = sentCoins[key];
      }
    }

    try {
      await this.db.object('/users/'+toUser.uid+'/userData').update({
        wallet: toUser.wallet,
        balance: toUser.balance
      });
    }
    catch (error) {
      console.error(error);
      throw new Error("Send fail");
    }
    return true;
  }

  private logTransfer(toUser:User, amount:number):void {

    let logItem = {
      "from" : this.user.uid,
      "to" : toUser.uid,
      "timestamp" : firebase.database['ServerValue']['TIMESTAMP'],
      "amount" : amount
    } as LogItem;

    //add to the main transaction log
    this.transactionLog$.push(logItem);
  }

  public createTransactionIntent(toUserId:string, amount:number, message?:string): Promise<any> {
    let p = new Promise( (resolve, reject) => {
      let toUser = this.userService.keyToUser(toUserId);
      if(this.transfer(toUser, amount)) {

        this.logTransfer(toUser, amount);
        this.newsService.addTransaction(toUser, amount, message);
        resolve(true);
      }
      else
        reject(new Error("Transfer Failed"));
    });

    return p;
  }

  //which of the receivingUser's trusted coins does the sendingUser have?
  private getTrustIntersection(sendingUser:User, receivingUser:User) {
    let returnArray = [];
    let sum = 0;
    let rTrusts = receivingUser.trustedUsers as string[];

    if (receivingUser.trustedUsers) {
      for (let tUserKey of rTrusts) {
        if (sendingUser.wallet[tUserKey]) {
          sum += this.user.wallet[tUserKey].amount;
          let p = this.user.wallet[tUserKey].priority;
          returnArray[p] = this.user.wallet[tUserKey];
        }
      }
    }
    return {trustedCoins:returnArray,balance:sum};
  }

  ngOnDestroy() {
    this.userSub$.unsubscribe();
  }

}
