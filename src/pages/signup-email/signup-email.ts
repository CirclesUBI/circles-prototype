import { Component } from '@angular/core';
import { Loading, LoadingController, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthService } from '../../providers/auth-service/auth-service';

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

    this.createUserForm = this.formBuilder.group({
      email: [null,  Validators.compose([Validators.required, Validators.email])],
      password1: [null, Validators.required],
      password2: [null, Validators.required],
    }, { validator: this.passwordsAreEqual.bind(this) });
  }

  // tslint:disable-next-line:no-unused-variable
  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.loading = this.loadingCtrl.create({
      content: 'Registering ...',
      dismissOnPageChange: true
    });
    this.loading.present();

    this.authService.createAuthUser(formData.email,formData.password1).then(
      (success) => {},
      (error) => {
        this.loading.dismiss();
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

}
