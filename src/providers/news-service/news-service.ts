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
import { ValidatorService } from '../../providers/validator-service/validator-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';
import { NewsItem } from '../../interfaces/news-item-interface';
import { Validator } from '../../interfaces/validator-interface';

@Injectable()
export class NewsService implements OnDestroy {

  private newsItemsFirebaseList$: FirebaseListObservable<NewsItem[]>;
  private newsItemsSub$: Subscription;

  private newsItemsReversed$: BehaviorSubject<NewsItem[]> = new BehaviorSubject([]);
  private newsItems$: BehaviorSubject<NewsItem[]> = new BehaviorSubject([]);

  constructor(
    private authService: AuthService,
    private db: AngularFireDatabase,
    private notificationsService: NotificationsService,
    private userService: UserService,
    private validatorService: ValidatorService
  ) {

    this.authService.loggedInState$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          let l = this.newsItemsFirebaseList$;
          this.setupDBQuery(this.userService.user.uid);
        }
        else {
          //todo:logout stuff
        }
      }
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
          let msg = 'Receieved ' + latestNewsItem.amount + ' Circles from ' + this.userService.keyToUser(latestNewsItem.from).displayName;
          this.notificationsService.create('Transaction', msg, 'info');
        }
        else if (latestNewsItem.type == 'createAccount') {
          debugger;
          let msg = 'Welcome to Circles ' +this.userService.user.displayName +'!';
          this.notificationsService.create('User Created', msg, 'success');
        }
        else if (latestNewsItem.type == 'issuance') {
          let msg = 'You have minted ' + latestNewsItem.amount + ' ' +this.userService.user.coins.title+ 's!';
          this.notificationsService.create('Issuance', msg, 'info');
        }
        else if (latestNewsItem.type == 'trustUser' && latestNewsItem.from == this.userService.user.uid) {
          let msg = 'You have started trusting: ' + this.userService.keyToUser(latestNewsItem.to).displayName;
          this.notificationsService.create('Trust', msg, 'success');
        }
        else if (latestNewsItem.type == 'trustUser' && latestNewsItem.to == this.userService.user.uid) {
          let msg = this.userService.keyToUser(latestNewsItem.from).displayName + 'has started trusting you';
          this.notificationsService.create('Trust', msg, 'success');
        }
        else if (latestNewsItem.type == 'revokeUser' && latestNewsItem.from == this.userService.user.uid) {
          let msg = 'You have stopped trusting: ' + this.userService.keyToUser(latestNewsItem.to).displayName;
          this.notificationsService.create('Revoke', msg, 'warn');
        }
        else if (latestNewsItem.type == 'revokeUser' && latestNewsItem.to == this.userService.user.uid) {
          let msg = this.userService.keyToUser(latestNewsItem.from).displayName + 'has stopped trusting you';
          this.notificationsService.create('Revoke', msg, 'warn');
        }
        else if (latestNewsItem.type == 'validatorAccept') {
          let msg = 'You have been validated by: ' +this.validatorService.keyToValidator(latestNewsItem.from).displayName;
          this.notificationsService.create('Validation', msg, 'success');
        }
        else if (latestNewsItem.type == 'revokeValidator') {
          let msg = 'You are no longer validated by: ' +this.validatorService.keyToValidator(latestNewsItem.from).displayName;
          this.notificationsService.create('Revoke', msg, 'warn');
        }
        else if (latestNewsItem.type == 'validatorRequest') {
          let msg = 'You applied for validation from: ' +this.validatorService.keyToValidator(latestNewsItem.from).displayName;
          this.notificationsService.create('Apply', msg, 'info');
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

  public signOut() {
    if (this.newsItemsSub$)
      this.newsItemsSub$.unsubscribe();
  }

  ngOnDestroy () {
    this.newsItemsSub$.unsubscribe();
  }

}
