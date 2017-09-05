import { Component, ViewChild } from '@angular/core';
import { Loading, LoadingController, ModalController, NavParams, Slides, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/interval";

import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';
import { StorageService, UploadImage } from '../../providers/storage-service/storage-service';
import { UserService } from '../../providers/user-service/user-service';

import { WaitModal } from '../wait-modal/wait-modal'

@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  private authUser: any;
  private userObs$: FirebaseObjectObservable<User>;
  private toast: Toast;

  private loading: Loading;

  @ViewChild(Slides) welcomeSlider: Slides;

  private formGroups: Array<FormGroup>;
  private userTypeForm: FormGroup;
  private individualForm: FormGroup;
  private organisationForm: FormGroup;
  private picForm: FormGroup;
  private disclaimerForm: FormGroup;

  private profilePicUpload: UploadImage;

  private profilePicURL: string = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2FGeneric_Image_Missing-Profile.jpg?alt=media&token=f1f08984-69f3-4f25-b505-17358b437d7a";
  private base64ImageData: string;

  private formState = {
    type: <string>null,
    submitAttempt: <boolean>false,
    profilePicRequired: <boolean>false,
    profilePicSelected: <boolean>false,
    isResizingImage:  <boolean>false
  };

  private profilePageViewNames: Array<string> = ['Intro', 'User Type', 'User Info', 'Picture', 'Disclaimer'];

  constructor(
    private sanitizer: DomSanitizer,
    private db: AngularFireDatabase,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private modalController: ModalController,
    private navParams: NavParams,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {

    this.authUser = this.navParams.get('authUser');
    this.userObs$ = this.db.object('/users/'+this.authUser.uid);

    this.userTypeForm = this.formBuilder.group({
      type: [null, Validators.required],
    });

    this.individualForm = this.formBuilder.group({
      firstName: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lastName: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: [this.authUser.email, Validators.email]
    });

    this.organisationForm = this.formBuilder.group({
      organisation: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
      tagline: [null, Validators.compose([Validators.maxLength(60)])],
      website: [null],
      email: [this.authUser.email, Validators.email]
    });

    this.picForm = this.formBuilder.group({
      profilePicURL: [null, Validators.minLength(24)],
    });

    this.disclaimerForm = this.formBuilder.group({

    });

    // Missing array elems are added based on setUserTypeSlides()
    this.formGroups = [null, this.userTypeForm, null, this.picForm, this.disclaimerForm];

  }

  // tslint:disable-next-line:no-unused-variable
  private onFirstSlideSubmit() {
    if (this.userTypeForm.controls.type.value)
      this.setUserTypeSlides();
    this.welcomeSlider.slideNext();
  }

  // tslint:disable-next-line:no-unused-variable
  private onSecondSlideSubmit() {
    this.setUserTypeSlides();
    this.welcomeSlider.lockSwipeToNext(false);
    this.welcomeSlider.slideNext();
  }

  // tslint:disable-next-line:no-unused-variable
  private onSubmit(formData: any, formValid: boolean): void {
    if (!formValid)
      return;

    this.welcomeSlider.lockSwipeToNext(false);
    this.welcomeSlider.slideNext();
  }

  private setUserTypeSlides(): void {

    this.formState.type = this.userTypeForm.controls.type.value;
    //we have the user type so build the formgroup array to fit the form path
    if (this.formState.type == 'individual') {
      this.formGroups[2] = this.individualForm;
    }
    else {
      this.formGroups[2] = this.organisationForm;
    }
  }

  // tslint:disable-next-line:no-unused-variable
  private onSlideWillChange(): void {
    // this returns the slide we are going to
    let i = this.welcomeSlider.getActiveIndex();

    //this will stop users from swiping to the next slide if they have not completed the current one
    if (this.formGroups[i] && !this.formGroups[i].valid)
      this.welcomeSlider.lockSwipeToNext(true);
    else
      this.welcomeSlider.lockSwipeToNext(false);

  }

  // tslint:disable-next-line:no-unused-variable
  private onSlideDidChange(): void {
    let i = this.welcomeSlider.getActiveIndex();
    //let slideName = this.profilePageViewNames[i];
    //this.analytics.trackPageView('Profile Page: ' + slideName);
  }


  public fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {

      this.welcomeSlider.lockSwipeToNext(true);
      this.formState.isResizingImage = true;

      var reader = new FileReader();
      reader.onload = (e) => {
        this.storageService.simpleResize(e.target['result'],1024,768).then(
          (imgObj:any) => {
            this.base64ImageData = imgObj.imgData;
            this.profilePicURL = imgObj.imgURL;
            this.formState.isResizingImage = false;
            this.profilePicUpload = new UploadImage(this.base64ImageData,this.authUser.uid);
          }
        );
      }
      reader.readAsDataURL(fileInput.target.files[0]);
  }
}

  // tslint:disable-next-line:no-unused-variable
  private saveForm(): void {

    this.loading = this.loadingCtrl.create({
      content: 'Saving Profile ...'
    });
    this.loading.present();

    let user = {} as any;
    user.uid = this.authUser.uid;

    if (this.formState.type === 'individual') {
      user = user as Individual;
      user.firstName = this.individualForm.get('firstName').value;
      user.lastName = this.individualForm.get('lastName').value;
      user.email = this.individualForm.get('email').value || '';
      user.profilePicURL = this.picForm.get('profilePicURL').value;
    }
    else {
      user = user as Organisation;
      user.organisation = this.organisationForm.get('organisation').value;
      user.email = this.organisationForm.get('email').value || '';
      user.greeting = this.organisationForm.get('tagline').value || '';
      user.website = this.organisationForm.get('website').value || '';
      user.profilePicURL = this.picForm.get('profilePicURL').value;
    }

    if (this.profilePicUpload) {

      let progressIntervalObs$ = Observable.interval(200).subscribe( () => {
        this.loading.data.content = this.sanitizer.bypassSecurityTrustHtml(
          '<p>Saving Profile ...</p><progress value="'+this.profilePicUpload.progress+'" max="100"></progress>'
        );
      });

      this.storageService.uploadFile(this.profilePicUpload).then(
        (profileURL) => {
          user.profilePicURL = profileURL;
          progressIntervalObs$.unsubscribe();
          this.saveUser(user);
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
        }
      );
    }
    else {
      //save w generic profile pic
      this.saveUser(user);
    }
  }

  private saveUser(formUser) {
    //sends us back to app.component's auth observer

    let providers = ['name'];
    if (formUser.email === this.authUser.email && this.authUser.emailVerified) {
      providers.push('email');
    }
    if (formUser.profilePicURL) {
      providers.push('photo');
    }
    else {
      formUser.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2FGeneric_Image_Missing-Profile.jpg?alt=media&token=f1f08984-69f3-4f25-b505-17358b437d7a";
    }

    formUser.authProviders = this.authUser.providerData.map(
      (provider) => {
        return provider.providerId.split('.')[0];
      }
    ).concat(providers).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });

    if (!formUser.authProviders.find( (prov) => prov == 'email')) {
      let waitModal = this.modalController.create(WaitModal);
      this.userService.sendAndWaitEmailVerification(waitModal).then(
       (user) => {
         formUser.authProviders.push('email');
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
     ).then( () => {
       this.userObs$.set({userData:formUser}).then(
         (result) => {
           this.loading.dismiss();
         },
         (error) => {
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
    }
    else {
      this.userObs$.set({userData:formUser}).then(
        (result) => {
          this.loading.dismiss();
        },
        (error) => {
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
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
  }

}
