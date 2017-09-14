import { Component } from '@angular/core';
import { NavController, NavParams, Toast, ToastController } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../../providers/user-service/user-service';

import { Coin } from '../../interfaces/coin-interface';

@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {

  private user: any;
  private userSub$: Subscription;
  private toast: Toast;
  private displayWallet: Array<Coin>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,
    private toastCtrl: ToastController
  ) {}

  // tslint:disable-next-line:no-unused-variable
  private priorityUp(coin) {
    coin.priority--;
    let c1 = this.displayWallet[coin.priority];
    c1.priority++;
    this.displayWallet[coin.priority] = coin;
    this.displayWallet[c1.priority] = c1;
  }

  // tslint:disable-next-line:no-unused-variable
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
      }
    );
  }

  // tslint:disable-next-line:no-unused-variable
  private async save() {
    for (let c of this.displayWallet as any) {
      c.displayOwner = null;
      this.user.wallet.coins[c.owner] = c;
    }
    this.userService.updateUser({wallet:this.user.wallet});
    this.navCtrl.pop();
  }

  ionViewDidLoad() {

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        this.displayWallet = [];
        for (let i in this.user.wallet.coins) {
          if (this.user.organisation && this.user.wallet.coins[i].owner == this.user.uid)
            continue;
          let w = Object.assign({},this.user.wallet.coins[i]) as any;
          w.displayOwner = this.userService.keyToUser(w.owner).displayName;
          this.displayWallet.push(w);
        }
        this.orderByPriority();
      },
      error => {
        this.toast = this.toastCtrl.create({
          message: 'Error getting user: '+error,
          duration: 4000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      },
      () => console.log('send ionViewDidLoad userSub$ obs complete')
    );
  }

}
