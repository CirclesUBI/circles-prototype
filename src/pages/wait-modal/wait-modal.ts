import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-wait-modal',
  templateUrl: 'wait-modal.html',
})
export class WaitModal {

  private message: string;
  private title: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.message = navParams.get('message');
    this.title = navParams.get('title');
  }

  closeModal() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmModalPage');
  }

}
