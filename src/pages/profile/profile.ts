import { Component } from '@angular/core';
import { Loading, LoadingController, NavController, NavParams, Toast, ToastController } from 'ionic-angular';
import { NotificationsService } from 'angular2-notifications';

import { DomSanitizer } from '@angular/platform-browser';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../providers/auth-service/auth-service';
import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';
import { ValidatorService } from '../../providers/validator-service/validator-service';
import { StorageService, UploadImage, UploadFile } from '../../providers/storage-service/storage-service';
import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';

import { SearchPage } from '../search/search';
import { UserDetailPage } from '../user-detail/user-detail';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  private toast: Toast;
  private base64ImageData: string;
  private imageBlob: Blob;
  private profilePicURL: any;
  public debugText: string = '';
  private emailVerified: boolean = false;
  private imageLoading: boolean = false;
  private imageFile: File;

  private userSub$: Subscription;
  private providers: Array<any>;
  private user: User = {} as User;

  private loading: Loading;
  private fileSelected: any;
  private profilePicUpload: UploadImage | UploadFile;

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private ds: DomSanitizer,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private notificationsService: NotificationsService,
    private sanitizer: DomSanitizer,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private userService: UserService,
    private validatorService: ValidatorService
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');

    this.userSub$ = this.userService.user$.subscribe(
      user => {
        this.user = user;
        if (this.user.profilePicURL) {
          this.profilePicURL = this.user.profilePicURL;
        }
        this.providers = this.validatorService.userProviders;
        this.emailVerified  = (this.user.authProviders.filter(prov => prov == 'email').length > 0);
      }
    );

    //this.emailVerified = firebase.auth().currentUser.emailVerified;

    // document.addEventListener('DOMContentLoaded',function() {

    document.getElementById('file').onchange = this.fileChangeEvent.bind(this);

    // }
    //});
  }

  public fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.debugText += 'fileChangeEvent';
      this.imageLoading = true;

      this.storageService.ngResize(fileInput.target.files[0]).subscribe(
        (imageFile) => {
          var reader = new FileReader();
          reader.onload = (e) => {
            this.imageLoading = false;
            this.profilePicURL = e.target['result'];
            this.base64ImageData = this.profilePicURL.substring(23);
            this.profilePicUpload = new UploadImage(this.base64ImageData, this.user.uid);
            //this.imageFile = imageFile;
          }
          reader.readAsDataURL(imageFile);
        },
        (error) => {
          //todo: error msg
        }
      );
    }
  }


  private fileUpload() {

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
      //this.storageService.uploadFile(this.profilePicUpload).then(
      (profileURL) => {
        this.user.profilePicURL = profileURL;
        progressIntervalObs$.unsubscribe();
        this.loading.dismiss();
        if (!this.user.authProviders['photo'])
          this.user.authProviders.push('photo');
        this.userService.updateUser({ profilePicURL: this.user.profilePicURL, authProviders:this.user.authProviders });
      },
      (error) => {
        progressIntervalObs$.unsubscribe();
        this.toast = this.toastCtrl.create({
          message: error.message + ': ' + error.details,
          duration: 2500,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      }
    );
  }

  private saveProfile() {
    if (this.userService.type == 'individual') {
      let u = this.user as Individual;
      this.user.displayName = u.firstName + ' ' + u.lastName;
    }
    else {

    }
    if (this.user.email != firebase.auth().currentUser.email) {
      firebase.auth().currentUser.updateEmail(this.user.email).then(
        (result) => this.sendEmailVerif(),
        (error) => {
          this.toast = this.toastCtrl.create({
            message: 'Error updating email: ' + error,
            duration: 2500,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
        }
      );
    }

    this.userService.saveUser();
    this.navCtrl.pop();
  }

  private gotoProvider(prov) {
    //todo: deal with photo/email etc
    if (
      prov.completed ||
      prov.displayName == 'Profile Photo' ||
      prov.displayName == 'Passport' ||
      prov.displayName == 'Steam' ||
      prov.displayName == 'SoundCloud'
    ) {
      return;
    }
    else if (prov.displayName == 'Email') {
      this.sendEmailVerif();
    }
    else {
      var provider;

      //todo: not firing
      // firebase.auth().getRedirectResult().then(
      //   (result) => {
      //     console.log(result);
      //     if (result.credential) {
      //       // Accounts successfully linked.
      //       var credential = result.credential;
      //       var user = result.user;
      //       // ...
      //     }
      //   },
      //   (error) => {
      //     console.log(error);
      //   }
      // );

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
          var credential = result.credential;
          var user = result.user;
          // ...
        },
        (error) => {
          this.toast = this.toastCtrl.create({
            message: 'Error linking accounts: ' + error,
            duration: 2500,
            position: 'middle'
          });
          console.error(error);
          this.toast.present();
        }
      );
    }
  }

  sendEmailVerif() {
    firebase.auth().currentUser.sendEmailVerification().then(
      (result) => {
        let msg = 'Verification Email sent to: ' +this.user.email;
        this.notificationsService.create('Email', msg, 'info');
      },
      (error) => {
        this.toast = this.toastCtrl.create({
          message: 'Error sending email verification: ' + error,
          duration: 2500,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      }
    );
  }

}
