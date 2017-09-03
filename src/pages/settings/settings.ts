import { Component } from '@angular/core';
import { Loading, LoadingController, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {


  private settings: any;
  private firebaseSettingsObj$: FirebaseObjectObservable<any>;
  private settingsSub$: Subscription;

  private loading: Loading;

  constructor(
    public navCtrl: NavController,
    private db: AngularFireDatabase,
    private loadingCtrl: LoadingController,
    private navParams: NavParams
  ) {
    let uid = navParams.data.uid;
    this.firebaseSettingsObj$ = this.db.object('/users/'+uid+'/settings/');
    this.settingsSub$ = this.firebaseSettingsObj$.subscribe(
      (settings) => {
        this.settings = settings;
      }
    );
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  private saveSettings() {
    this.loading = this.loadingCtrl.create({
      content: 'Saving settings ...',
    });
    this.loading.present();

    this.firebaseSettingsObj$.set(this.settings).then(
      (res) => {
        this.loading.dismiss();
        this.navCtrl.pop();
      }
    );
  }

}
