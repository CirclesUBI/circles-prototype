import { Injectable, OnDestroy } from '@angular/core';
import { OneSignal, OSNotification } from '@ionic-native/onesignal';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import { LogItem } from '../../interfaces/log-item-interface';
import { environment } from '../../environments/environment';
import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

@Injectable()
export class PushService implements OnDestroy {

  private user: User;

  constructor(private oneSignal: OneSignal, private userService: UserService) {

    // Enable to debug issues.
    // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    debugger;
    this.oneSignal.startInit(environment.cloudSettings.push.app_id, environment.cloudSettings.push.sender_id);

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

    this.oneSignal.handleNotificationReceived().subscribe(() => {
     console.log('handleNotificationReceived()');
    });

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      console.log('handleNotificationOpened()');
    });

    this.oneSignal.endInit();

    this.userService.initUserSubject$.first().subscribe(
      (user) => {
        debugger;
        if (user.pushID)
          return;

        let ids = this.oneSignal.getIds().then(
          (ids) => {
            this.userService.updateUser({pushID: ids.userId});
          },
          (error) => console.log(error)
        );
      }
    );
  }

  public async pushToUser(toUser: User, message: string) {
    let notificationObj = {
      contents: {en: message},
      headings: {en: 'Circles Incoming!'},
      include_player_ids: [toUser.pushID]
    } as OSNotification;
    return await this.oneSignal.postNotification(notificationObj);
  }

  ngOnDestroy () {
    //this.dbNewsSub$.unsubscribe();
  }

}
