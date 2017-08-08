import { Component } from '@angular/core';
import { NavController, NavParams, Toast, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { Coin } from '../../interfaces/coin-interface';

@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {

  private user: User;
  private userSub$: Subscription;
  private toast: Toast;
  private displayWallet: Array<Coin>;

  constructor(
    private db: AngularFireDatabase,
    public navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,
    private toastCtrl: ToastController
  )
  { }

  private priorityUp(coin) {
    coin.priority--;
    let c1 = this.displayWallet[coin.priority];
    c1.priority++;
    this.displayWallet[coin.priority] = coin;
    this.displayWallet[c1.priority] = c1;
  }

  private priorityDown(coin) {
    coin.priority++;
    let c1 = this.displayWallet[coin.priority];
    c1.priority--;
    this.displayWallet[coin.priority] = coin;
    this.displayWallet[c1.priority] = c1;
  }


  private orderByPriority() {
    this.displayWallet.sort(
      (a,b) => {
        if (a.priority > b.priority) {
          return 1;
        }

        if (a.priority < b.priority) {
         return -1;
        }
      return 0;
    });
  }

  private async save() {
    for (let c of this.displayWallet) {
      this.user.wallet[c.owner] = c;
    }
    this.userService.updateUser({wallet:this.user.wallet});
    this.navCtrl.pop();
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad WalletPage');

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        this.displayWallet = [];
        for (let i in this.user.wallet) {
          let w = Object.assign({},this.user.wallet[i]) as any;
          w.displayOwner = this.userService.keyToUserName(w.owner);
          this.displayWallet.push(w);
        }
        this.orderByPriority();
      },
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

}
