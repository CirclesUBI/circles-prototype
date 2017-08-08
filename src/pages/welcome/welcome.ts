import { Component, ViewChild } from '@angular/core';
import { Loading, LoadingController, NavController, NavParams, Slides, Toast, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { FirebaseObjectObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/interval";

import { HomePage } from '../home/home';
import { User } from '../../interfaces/user-interface';
import { Individual } from '../../interfaces/individual-interface';
import { Organisation } from '../../interfaces/organisation-interface';
import { StorageService, UploadFile } from '../../providers/storage-service/storage-service';
import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';

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

  private profilePicUpload: UploadFile;

  private profilePicURL: string = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2FGeneric_Image_Missing-Profile.jpg?alt=media&token=f1f08984-69f3-4f25-b505-17358b437d7a";
  private base64ImageData: string;

  private formState = {
    type: <string>null,
    submitAttempt: <boolean>false,
    profilePicRequired: <boolean>false,
    profilePicSelected: <boolean>false
  };

  private profilePageViewNames: Array<string> = ['Intro', 'User Type', 'User Info', 'Picture', 'Disclaimer'];

  constructor(
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private newsService: NewsService,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {

    this.authUser = navParams.get('authUser');
    this.userObs$ = navParams.get('obs');

    this.userTypeForm = formBuilder.group({
      type: [null, Validators.required],
    });

    this.individualForm = formBuilder.group({
      firstName: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lastName: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: [this.authUser.email, Validators.email]
    });

    this.organisationForm = formBuilder.group({
      organisation: [null, Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
      tagline: [null, Validators.compose([Validators.maxLength(60)])],
      website: [null],
      email: [this.authUser.email, Validators.email]
    });

    this.picForm = formBuilder.group({
      profilePicURL: [null, Validators.minLength(24)],
    });

    this.disclaimerForm = formBuilder.group({

    });

    // Missing array elems are added based on setUserTypeSlides()
    this.formGroups = [null, this.userTypeForm, null, this.picForm, this.disclaimerForm];

  }

  private onFirstSlideSubmit() {
    if (this.userTypeForm.controls.type.value)
      this.setUserTypeSlides();
    this.welcomeSlider.slideNext();
  }

  private onSecondSlideSubmit() {
    this.setUserTypeSlides();
    this.welcomeSlider.lockSwipeToNext(false);
    this.welcomeSlider.slideNext();
  }

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

  private onSlideWillChange(): void {
    // this returns the slide we are going to
    let i = this.welcomeSlider.getActiveIndex();

    //this will stop users from swiping to the next slide if they have not completed the current one
    if (this.formGroups[i] && !this.formGroups[i].valid)
      this.welcomeSlider.lockSwipeToNext(true);
    else
      this.welcomeSlider.lockSwipeToNext(false);

  }

  private onSlideDidChange(): void {
    let i = this.welcomeSlider.getActiveIndex();
    let slideName = this.profilePageViewNames[i];
    //this.analytics.trackPageView('Profile Page: ' + slideName);
  }


  public fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {

      var reader = new FileReader();
      reader.onload = (e) => {
        let img = new Image;
        img.src = reader.result;
        img.onload = ( (file) => {

          this.storageService.resizePicFile(fileInput.target.files, img.height, img.width).subscribe(
            imageBlob => {
              this.profilePicURL = URL.createObjectURL(imageBlob);
              this.base64ImageData = this.profilePicURL.substring(23);
              this.profilePicUpload = new UploadFile(imageBlob as File, this.authUser.uid);
            }
          );
        });
      }

      reader.readAsDataURL(fileInput.target.files[0]);
  }
}


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
      user.displayName = user.firstName + ' ' + user.lastName;
      user.email = this.individualForm.get('email').value || '';
      user.profilePicURL = this.picForm.get('profilePicURL').value;
    }
    else {
      user = user as Organisation;
      user.displayName = this.organisationForm.get('organisation').value;
      user.email = this.organisationForm.get('email').value || '';
      user.greeting = this.organisationForm.get('tagline').value || '';
      user.website = this.organisationForm.get('website').value || '';
      user.profilePicURL = this.picForm.get('profilePicURL').value;
    }

    if (this.profilePicUpload) {

      let progressIntervalObs$ = Observable.interval(200).subscribe( () => {
        this.loading.data.content = this.sanitizer.bypassSecurityTrustHtml(
          '<p>Saving Profile ...</p><progress value="'+this.profilePicUpload.progress+'" max="100"></progress>'
        )
      });

      this.storageService.uploadFile(this.profilePicUpload).then(
        (profileURL) => {
          user.profilePicURL = profileURL;
          progressIntervalObs$.unsubscribe();
          user.authProviders = ['photo'];
          this.saveUser(user);
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
    else {
      //save w generic profile pic
      user.profilePicURL = this.profilePicURL;
      this.saveUser(user);
    }
  }

  private saveUser(formUser) {
    //sends us back to app.component's auth observer

    let user = this.userService.createCirclesUser(formUser);

    this.userObs$.set({userData:user}).then(
      (result) => {
        this.loading.dismiss();
      },
      (error) => {
        this.loading.dismiss();
        this.toast = this.toastCtrl.create({
          message: 'Error saving User record: ' + error,
          duration: 2500,
          position: 'middle'
        });
        console.error(error);
        this.toast.present();
      }
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
  }

}
