import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-confirm-modal',
  templateUrl: 'confirm-modal.html',
})
export class ConfirmModal {

  private message: string;
  private title: string;

  constructor(
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.message = navParams.get('message');
    this.title = navParams.get('title');
  }

  // tslint:disable-next-line
  private confirm (decision): void {
    this.viewCtrl.dismiss(decision).catch((err) => console.log('view was not dismissed: '+err));;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmModalPage');
  }

}
