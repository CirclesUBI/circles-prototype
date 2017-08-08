import { Injectable } from '@angular/core';
import { Toast, ToastController } from 'ionic-angular';

import { Ng2PicaService } from 'ng2-pica';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/map';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';


export class Upload {
  $key: string;
  createdAt: Date = new Date();
  name: string;
  owner: string;
  progress: number;
  size:number;
  url: string;
}

export class UploadImage extends Upload {
  base64String: string;
  constructor(base64String: string, owner:string) {
    super();
    this.owner = owner;
    this.base64String = base64String;
  }
}

export class UploadFile extends Upload {
  file: File;
  constructor(file: File, owner:string) {
    super();
    this.owner = owner;
    this.file = file;
  }
}

@Injectable()
export class StorageService {

  private profilePicRef: any;

  private toast: Toast;

  private uploads: FirebaseListObservable<Upload[]>;

  private progressSubject$: Subject<number> = new Subject(); //3 should add smoothing?!?
  public progress$: Observable<number>;
  public loading$: Observer<any>;

  constructor(
    private db: AngularFireDatabase,
    private pica: Ng2PicaService,
    private toastCtrl: ToastController
  ) {
    this.profilePicRef = firebase.storage().ref('/profilepics');
    this.progress$ = this.progressSubject$.asObservable();

    this.uploads = this.db.list('/uploads');
  }

  resizeAndUploadProfilePic(upload: UploadImage): Promise<any> {

    return this.resizeProfilePic(upload, 1024, 768).then(
      uploadResized => {
        return this.uploadFile(uploadResized);
      }
    )
  }

  public resizePicFile(files: File[], sourceHeight:number, sourceWidth:number): Observable<any> { //}: Promise<Upload>{

    let fileList = Array.from(files);

    let maxHeight = 1024;
    let maxWidth = 768;
    let h,w;

    if (sourceHeight > sourceWidth) {
      let ratio = maxHeight/sourceHeight;
      h = maxHeight;
      w = sourceWidth * ratio;
    }
    else if (sourceWidth >= sourceHeight){
      let ratio = maxWidth/sourceWidth;
      w = maxWidth;
      h = sourceHeight * ratio;
    }

    return this.pica.resize(fileList, w, h);
  }

  public async resizeProfilePic(upload: UploadImage, maxHeight:number, maxWidth:number): Promise<Upload>{
    return new Promise<Upload>((resolve, reject) => {

      let img = new Image;
      img.src = upload.base64String;

      img.onload = ( (file) => {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        let h,w;

        ctx.drawImage(img, 0, 0);

        if (img.height > img.width) {
          let ratio = img.width/img.height;
          h = maxHeight;
          w = img.width * ratio;
        }
        else if (img.width >= img.height){
          let ratio = img.height/img.width;
          w = maxWidth;
          h = img.height * ratio;
        }

        var canvas2 = document.createElement('canvas');
        var ctx2 = canvas.getContext('2d');
        // We set the dimensions at the wanted size.
        canvas.width = w;
        canvas.height = h;
        this.pica.resizeCanvas(canvas, canvas2, {
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        })
        .then(
          result => {

          }
        )
        resolve(upload);
      });

      img.onerror = ((error) => {
        let err = {details:error,message:'Error loading as image'};
        reject(err);
      });
    });
  }

  public async uploadFile(upload: Upload){

    let uploadTask;
    if (upload instanceof UploadImage) {
      let c = this.profilePicRef.child(upload.owner+'.jpg');
      uploadTask = c.putString(upload.base64String, 'base64', { contentType: 'image/jpg' });
    }
    else if (upload instanceof UploadFile) {
      let c = this.profilePicRef.child(upload.owner+'.jpg');
      uploadTask = c.put(upload.file);
    }

    return new Promise<string> ((resolve,reject) => {
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + upload.progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          let err = {details:error,message:'Error uploading image'};
          reject(err);
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          console.log('Upload Complete');
          //upload.progress = 100;
          let uploadLogEntry = {
            createdAt: upload.createdAt,
            name: uploadTask.snapshot.metadata.name,
            size: uploadTask.snapshot.metadata.size,
            url:uploadTask.snapshot.downloadURL
          }
          this.saveFileData(uploadLogEntry);
          resolve(uploadTask.snapshot.downloadURL);
        }
      );
    });
  }

  public isUploadSupported(): boolean {
    if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
      return false;
    }
    var elem = document.createElement('input');
    elem.type = 'file';
    return !elem.disabled;
  }

  // Writes the file details to the realtime db
  private saveFileData(uploadLogEntry: any) {
    this.uploads.push(uploadLogEntry);
  }

}
