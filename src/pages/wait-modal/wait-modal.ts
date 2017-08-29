import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-wait-modal',
  templateUrl: 'wait-modal.html',
})
export class WaitModal {

  private message: string;
  private title: string;

  constructor(
    public navParams: NavParams
  ) {
    this.message = navParams.get('message');
    this.title = navParams.get('title');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmModalPage');
  }

}
