import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-email-confirmation',
  templateUrl: 'email-confirmation.html',
})
export class EmailConfirmationPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
    console.log("navParams");
    console.log(this.navParams.toString());
  }

}
