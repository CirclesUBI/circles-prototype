import { Injectable, OnDestroy } from '@angular/core';

import { NotificationsService  } from 'angular2-notifications';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/isEmpty';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';
import { NewsItem } from '../../interfaces/news-item-interface';
import { Validator } from '../../interfaces/validator-interface';

@Injectable()
export class NewsService implements OnDestroy {

  private user: User;

  private newsItemsFirebaseList$: FirebaseListObservable<NewsItem[]>;
  private newsItemsSub$: Subscription;

  private newsItemsReversed$: BehaviorSubject<NewsItem[]> = new BehaviorSubject([]);
  private newsItems$: BehaviorSubject<NewsItem[]> = new BehaviorSubject([]);

  constructor(
    private db: AngularFireDatabase,
    private notificationsService: NotificationsService,
    private userService: UserService
  ) { }

  public initialise (initUser) {
    this.setupDBQuery(initUser.uid);
    if (!initUser.agreedToDisclaimer)
      this.addCreateUser(initUser);

    this.userService.user$.subscribe(
      (user) => this.user = user,
      (error) => console.error(error),
      () => console.log('news-service constructor user$ obs complete')
    );
  }

  private setupDBQuery(uid):void {
    // sets up a db list binding that will initially return all messages from the last
    // two minutes and then any added to the list after that.
    this.newsItemsFirebaseList$ = this.db.list('/users/' + uid + '/news/');
    let twoMinsAgo = Date.now() - 120000;
    this.newsItemsFirebaseList$.$ref
      .orderByChild('timestamp')
      .startAt(twoMinsAgo)
      .on('child_added', (firebaseObj,index) => {
        let latestNewsItem = firebaseObj.val();
        //receiving from someone
        if (latestNewsItem.type == 'transaction' && latestNewsItem.to == uid) {
          let fromUser = this.userService.keyToUser(latestNewsItem.from);
          let msg = 'Receieved ' + latestNewsItem.amount + ' Circles from ' + fromUser.displayName;
          this.notificationsService.create('Transaction', msg, 'info');
        }
      });
      this.newsItemsFirebaseList$.subscribe(this.newsItems$);

      this.newsItemsSub$ = this.newsItemsFirebaseList$.subscribe(
        newsitems => {
          let rev = newsitems.sort((a,b) => a.timestamp < b.timestamp ? 1 : -1);
          this.newsItemsReversed$.next(rev);
        },
        error => {
          console.log("Firebase Error: " + error);
        },
        () => console.log('news-service setupDBQuery newsItemsSub$ obs complete')
      );
  }

  public get allNewsItems$(): BehaviorSubject<NewsItem[]> {
    return this.newsItems$;
  }

  public get allnewsItemsReversed$(): BehaviorSubject<NewsItem[]> {
    return this.newsItemsReversed$;
  }

  public addTransaction(toUser:User, amount:number, message?:string):void {
    //this will only be called for sending to someone else
    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      from: this.user.uid,
      amount: amount,
      to: toUser.uid,
      type: 'transaction',
      message: message || ''
    } as NewsItem;
    this.newsItemsFirebaseList$.push(newsItem);

    this.db.list('/users/'+toUser.uid+'/news/').push(newsItem);

  }


  public addValidatorTrustRequest(validator: Validator):void {

    let msg = 'You applied for validation from: ' +validator.displayName;
    this.notificationsService.create('Apply', msg, 'info');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      from: validator.$key,
      type: 'validatorRequest'
    } as NewsItem;
    this.newsItemsFirebaseList$.push(newsItem);
  }

  public addCreateUser(initUserData: Individual | Organisation):void {
    let msg = 'Welcome to Circles ' +initUserData.displayName +'!';
    this.notificationsService.create('User Created', msg, 'success');

    msg = 'Verification Email sent to: ' +this.user.email;
    this.notificationsService.create('Email', msg, 'info');

    let n = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      type: 'createAccount'
    } as NewsItem;
    this.newsItemsFirebaseList$.push(n);

    if (this.userService.type == 'organisation') {
      let n2 = {
        timestamp: firebase.database['ServerValue']['TIMESTAMP'],
        type: 'issuance',
        amount: initUserData.balance,
        coinTitle: initUserData.wallet[initUserData.uid].title
      } as NewsItem;
      this.newsItemsFirebaseList$.push(n2);
    }
  }

  public addValidatorTrustAccept(validator: Validator):void {

    let msg = 'You have been validated by: ' +validator.displayName;
    this.notificationsService.create('Validation', msg, 'success');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      from: validator.$key,
      type: 'validatorAccept'
    } as NewsItem;
    this.newsItemsFirebaseList$.push(newsItem);
  }

  public addTrust(user: User):void {

    let msg = 'You have started trusting: ' +user.displayName;
    this.notificationsService.create('Trust', msg, 'info');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      to: user.uid,
      type: 'trustUser'
    } as NewsItem;
    this.newsItemsFirebaseList$.push(newsItem);
  }

  public revokeUserTrust(user: User):void {

    let msg = 'You have stopped trusting: ' +user.displayName;
    this.notificationsService.create('Revoke', msg, 'warn');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      to: user.uid,
      type: 'revokeUser'
    } as NewsItem;
    this.newsItemsFirebaseList$.push(newsItem);
  }

  public revokeValidatorTrust(vali: Validator):void {

    let msg = 'You are no longer validated by: ' +vali.displayName;
    this.notificationsService.create('Revoke', msg, 'warn');

    let newsItem = {
      timestamp: firebase.database['ServerValue']['TIMESTAMP'],
      to: vali.$key,
      type: 'revokeValidator'
    } as NewsItem;
    this.newsItemsFirebaseList$.push(newsItem);
  }

  public signOut() {
    if (this.newsItemsSub$)
      this.newsItemsSub$.unsubscribe();
  }

  ngOnDestroy () {
    this.newsItemsSub$.unsubscribe();
  }

}
