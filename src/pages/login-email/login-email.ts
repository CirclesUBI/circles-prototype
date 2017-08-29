import { Component } from '@angular/core';
import { Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../providers/auth-service/auth-service';

@Component({
  selector: 'page-login-email',
  templateUrl: 'login-email.html',
})
export class LoginEmailPage {

  private loginForm: FormGroup;
  private loading: Loading;
  private toast: Toast;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {

    this.loginForm = this.formBuilder.group({
      email: [null,  Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.required]
    });
  }

  // tslint:disable-next-line:no-unused-variable
  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.loading = this.loadingCtrl.create({
      content: 'Logging In ...',
      //dismissOnPageChange: true
    });

    this.loading.present()

    this.authService.signInEmail(
      formData.email,
      formData.password
    ).then(
      success => {
        console.log('email auth success');
        this.loading.dismiss();
      }).catch(
      error => {
        this.toast = this.toastCtrl.create({
          message: error.toString(),
          duration: 4000,
          position: 'middle'
        });
        console.error(error);
        this.loading.dismiss();
        this.toast.present();
      });

  }

  ionViewDidLoad() {

  }

}
