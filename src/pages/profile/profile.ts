import { Component } from '@angular/core';
import { Loading, LoadingController, ModalController, NavController, Toast, ToastController } from 'ionic-angular';

import { DomSanitizer } from '@angular/platform-browser';

import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../providers/auth-service/auth-service';
import { UserService } from '../../providers/user-service/user-service';
import { ValidatorService } from '../../providers/validator-service/validator-service';
import { StorageService, UploadImage, UploadFile } from '../../providers/storage-service/storage-service';
import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';

import { WaitModal } from '../wait-modal/wait-modal'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  private toast: Toast;
  private base64ImageData: string;

  private profilePicURL: any;
  public debugText: string = '';
  private isEmailVerified: boolean = false;
  private isImageLoading: boolean = false;

  private userSub$: Subscription;
  private providers: Array<any>;
  private user: User = {} as User;

  private loading: Loading;
  private profilePicUpload: UploadImage | UploadFile;

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private modalController: ModalController,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private userService: UserService,
    private validatorService: ValidatorService
  ) {

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        if (this.user.profilePicURL) {
          this.profilePicURL = this.user.profilePicURL;
        }
        this.providers = this.validatorService.userProviders;
        this.isEmailVerified = (this.user.email == firebase.auth().currentUser.email && firebase.auth().currentUser.emailVerified)
        let isEmailAuth = (this.user.authProviders.filter((prov) => prov == 'email').length > 0);
        if (this.isEmailVerified != isEmailAuth) {
          if (this.isEmailVerified)
            this.user.authProviders.push('email');
          else
            this.user.authProviders = this.user.authProviders.filter((prov) => prov != 'email')

          this.userService.updateUser({ authProviders: this.user.authProviders });
        }
      }
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');



    // document.addEventListener('DOMContentLoaded',function() {

    document.getElementById('file').onchange = this.fileChangeEvent.bind(this);

    // }
    //});
  }


  public fileChangeEvent(fileInput: any) {
      if (fileInput.target.files && fileInput.target.files[0]) {
        var reader = new FileReader();
        this.isImageLoading = true;
        reader.onload = (e) => {

        this.storageService.simpleResize(e.target['result'],1024,768).then(
          (imgObj:any) => {
            this.base64ImageData = imgObj.imgData;
            this.profilePicURL = imgObj.imgURL;
            this.profilePicUpload = new UploadImage(this.base64ImageData,this.user.uid);
            this.isImageLoading = false;
          }
        );

          // var img = new Image;
          // img.src = e.target['result'];
          // img.onload = (() => {
          //   var canvas = document.createElement('canvas');
          //   var ctx = canvas.getContext('2d');
          //
          //   if (img.naturalWidth <= maxWidth && img.naturalHeight <= maxHeight) {
          //     this.profilePicURL = e.target['result'];
          //   }
          //   else {
          //    var ratio = 1;
          //    if(img.naturalWidth > maxWidth && img.naturalHeight > maxHeight) {
          //      if (img.naturalWidth / maxWidth >= img.naturalHeight / maxHeight) {
          //        ratio = maxWidth / img.naturalWidth;
          //      }
          //      else {
          //        ratio = maxHeight / img.naturalHeight;
          //      }
          //    }
          //    else if(img.naturalWidth > maxWidth)
          //      ratio = maxWidth / img.naturalWidth;
          //    else if(img.naturalHeight > maxHeight)
          //      ratio = maxHeight / img.naturalHeight;
          //
          //     // We set the dimensions at the wanted size.
          //     canvas.width = img.naturalWidth * ratio;
          //     canvas.height = img.naturalHeight * ratio;
          //
          //     // We resize the image with the canvas method drawImage();
          //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          //
          //     this.profilePicURL = canvas.toDataURL('image/jpeg', 0.7);
          //   }
          //   this.base64ImageData = this.profilePicURL.split(',')[1];
          //   this.isImageLoading = false;
          // });
        }
        reader.readAsDataURL(fileInput.target.files[0]);
      }
    }

  // tslint:disable-next-line:no-unused-variable
  private async fileUpload() {
    return new Promise<string> ((resolve,reject) => {
      this.loading = this.loadingCtrl.create({
        content: 'Uploading ...',
        //dismissOnPageChange: true
      });
      this.loading.present();

      let progressIntervalObs$ = Observable.interval(200).subscribe(() => {
        this.loading.data.content = this.sanitizer.bypassSecurityTrustHtml(
          '<p>Saving Profile ...</p><progress value="' + this.profilePicUpload.progress + '" max="100"></progress>'
        );
      });

      this.storageService.uploadFile(this.profilePicUpload).then(
        (profileURL) => {
          this.user.profilePicURL = profileURL;
          progressIntervalObs$.unsubscribe();
          this.loading.dismiss();
          if (!this.user.authProviders['photo'])
            this.user.authProviders.push('photo');
          resolve();
        },
        (error) => {
          progressIntervalObs$.unsubscribe();
          this.toast = this.toastCtrl.create({
            message: error.message + ': ' + error.details,
            duration: 4000,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
          reject(error);
        }
      );
    });
  }

  // tslint:disable-next-line:no-unused-variable
  private saveProfile() {
    if (this.userService.type == 'individual') {
      let u = this.user as Individual;
      this.user.displayName = u.firstName + ' ' + u.lastName;
    }
    else {

    }
    if (this.profilePicUpload) {
      this.fileUpload().then( () => {
        if (this.user.email != firebase.auth().currentUser.email) {
          firebase.auth().currentUser.updateEmail(this.user.email).then(
            (result) => {
              this.sendEmailVerif().then(
                () => {
                  this.userService.saveUser();
                  this.navCtrl.pop();
                },
                (error) => {
                  this.toast = this.toastCtrl.create({
                    message: 'Error sending email verification: ' + error,
                    duration: 4000,
                    position: 'middle'
                  });
                }
              );
            },
            (error) => {
              this.toast = this.toastCtrl.create({
                message: 'Error updating email: ' + error,
                duration: 4000,
                position: 'middle'
              });
              console.error(error);
              this.toast.present();
            }
          );
        }
        else {
          this.userService.saveUser();
          this.navCtrl.pop();
        }
      });
    }
    else {
      this.userService.saveUser();
      this.navCtrl.pop();
    }
  }

  // tslint:disable-next-line:no-unused-variable
  private gotoProvider(prov) {
    //todo: deal with photo/email etc
    if (
      prov.completed ||
      prov.displayName == 'Profile Photo' ||
      prov.displayName == 'Passport' ||
      prov.displayName == 'Steam' ||
      prov.displayName == 'SoundCloud'
    ) {return;}
    else if (prov.displayName == 'Email') {
      this.sendEmailVerif();
    }
    else {
      var provider;

      switch (prov.displayName) {
        case 'Facebook': {
          provider = new firebase.auth.FacebookAuthProvider();
        }
          break;
        case 'Google': {
          provider = new firebase.auth.GoogleAuthProvider();
        }
          break;
        case 'Github': {
          provider = new firebase.auth.GithubAuthProvider();
        }
          break;
        case 'Twitter': {
          provider = new firebase.auth.TwitterAuthProvider();
        }
          break;
      }

      this.authService.linkRedirect(provider).then(
        (result) => {
          //var credential = result.credential;
          //var user = result.user;
          // ...
        },
        (error) => {
          this.toast = this.toastCtrl.create({
            message: 'Error linking accounts: ' + error,
            duration: 4000,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
        }
      );
    }
  }

  private async sendEmailVerif() {
    return new Promise<string> ((resolve,reject) => {
      let waitModal = this.modalController.create(WaitModal);
      this.userService.sendAndWaitEmailVerification(waitModal).then(
        (user) => {
          this.user.authProviders.push('email');
          waitModal.dismiss();
        },
        (error) => {
          waitModal.dismiss();
          this.toast = this.toastCtrl.create({
            message: 'Error verifying email: ' + error,
            duration: 4000,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
        }
      ).then(() => {
        this.loading = this.loadingCtrl.create({
          content: 'Saving ...',
          //dismissOnPageChange: true
        });
        this.loading.present();
        this.userService.updateUser({ authProviders: this.user.authProviders }).then(
          (result) => {
            resolve();
            this.loading.dismiss();
          },
          (error) => {
            reject(error);
            this.loading.dismiss();
            this.toast = this.toastCtrl.create({
              message: 'Error saving User record: ' + error,
              duration: 4000,
              position: 'middle'
            });
            console.error(error);
            this.toast.present();
          }
        );
      });
    });
  }
}
