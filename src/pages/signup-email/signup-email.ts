import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { AngularFireAuth } from 'angularfire2/auth';

import { AuthService } from '../../providers/auth-service/auth-service';
import { User } from '../../interfaces/user-interface';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-signup-email',
  templateUrl: 'signup-email.html',
})
export class SignupEmailPage {

  private toast: Toast;
  private createUserForm: FormGroup;
  private loading: Loading;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController

  ) {

    this.createUserForm = formBuilder.group({
      email: [null,  Validators.compose([Validators.required, Validators.email])],
      password1: [null, Validators.required],
      password2: [null, Validators.required],
    }, { validator: this.passwordsAreEqual.bind(this) });
  }

  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.authService.createAuthUser(formData.email,formData.password1).then(
      (success) => {},
      (error) => {
        this.toast = this.toastCtrl.create({
          message: 'Firebase error: ' + error,
          duration: 4000,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      }
    );
  }

  private passwordsAreEqual(ctrl: FormControl): any {
    if (this.createUserForm && this.createUserForm.controls.password1.value) {
      let valid = this.createUserForm.controls.password1.value == this.createUserForm.controls.password2.value;
      return valid ? null : { 'passwordsAreEqual': true };
    }
  }

  ionViewDidLoad() {

  }

}
