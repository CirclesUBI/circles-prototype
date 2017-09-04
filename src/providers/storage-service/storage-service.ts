import { Injectable } from '@angular/core';

import { Ng2PicaService } from 'ng2-pica';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/map';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { dataURLtoBlob } from 'blueimp-canvas-to-blob';

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

  private uploads: FirebaseListObservable<Upload[]>;

  private progressSubject$: Subject<number> = new Subject(); //3 should add smoothing?!?
  public progress$: Observable<number>;
  public loading$: Observer<any>;

  constructor(
    private db: AngularFireDatabase,
    private pica: Ng2PicaService
  ) {
    this.profilePicRef = firebase.storage().ref('/profilepics');
    this.progress$ = this.progressSubject$.asObservable();
    this.uploads = this.db.list('/uploads');
  }

  public resizePicFile(files: File[], sourceHeight:number, sourceWidth:number): Observable<any> { //}: Promise<Upload>{

    let fileList = Array.from(files);

    let maxHeight = 800;
    let maxWidth = 600;
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

  public resize_image( src, dst, type?, quality? ) {
    var tmp = new Image(),
        canvas, context, cW, cH;

    type = type || 'image/jpeg';
    quality = quality || 0.8;

    cW = src.naturalWidth;
    cH = src.naturalHeight;

    tmp.src = src.src;
    tmp.onload = function() {

       canvas = document.createElement( 'canvas' );

       cW /= 2;
       cH /= 2;

       if ( cW < src.width ) cW = src.width;
       if ( cH < src.height ) cH = src.height;

       canvas.width = cW;
       canvas.height = cH;
       context = canvas.getContext( '2d' );
       context.drawImage( tmp, 0, 0, cW, cH );

       dst.src = canvas.toDataURL( type, quality );

       if ( cW <= src.width || cH <= src.height )
          return;

       tmp.src = dst.src;
    }

 }


 public simpleResize(src,maxWidth,maxHeight){
   let picURL;
   return new Promise ((resolve, reject) => {
     var img = new Image;
     img.src = src;
     img.onload = (() => {
       var canvas = document.createElement('canvas');
       var ctx = canvas.getContext('2d');

       if (img.naturalWidth <= maxWidth && img.naturalHeight <= maxHeight) {
         picURL = src;
       }
       else {
        var ratio = 1;
        if(img.naturalWidth > maxWidth && img.naturalHeight > maxHeight) {
          if (img.naturalWidth / maxWidth >= img.naturalHeight / maxHeight) {
            ratio = maxWidth / img.naturalWidth;
          }
          else {
            ratio = maxHeight / img.naturalHeight;
          }
        }
        else if(img.naturalWidth > maxWidth)
          ratio = maxWidth / img.naturalWidth;
        else if(img.naturalHeight > maxHeight)
          ratio = maxHeight / img.naturalHeight;

         // We set the dimensions at the wanted size.
         canvas.width = img.naturalWidth * ratio;
         canvas.height = img.naturalHeight * ratio;

         // We resize the image with the canvas method drawImage();
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

         picURL = canvas.toDataURL('image/jpeg', 0.7);
       }
       let base64ImageData = picURL.split(',')[1];
       resolve({imgData:base64ImageData,imgURL:picURL});
     });
  });
 }

 // public simple_resize(img,maxHeight,maxWidth) {
 //    // Create a canvas element
 //    var canvas = document.createElement('canvas');
 //    canvas.width = 3264;
 //    canvas.height = 2448;
 //
 //    // Get the drawing context
 //    var ctx = canvas.getContext('2d');
 //    var canvasCopy = document.createElement("canvas");
 //    var copyContext = canvasCopy.getContext("2d");
 //
 //    img.onload = function()
 //    {
 //        var ratio = 1;
 //
 //        if(img.width > maxWidth)
 //            ratio = maxWidth / img.width;
 //        else if(img.height > maxHeight)
 //            ratio = maxHeight / img.height;
 //
 //        canvasCopy.width = img.width;
 //        canvasCopy.height = img.height;
 //        copyContext.drawImage(img, 0, 0);
 //
 //        canvas.width = img.width * ratio;
 //        canvas.height = img.height * ratio;
 //        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
 //    };
 //
 //    img.src = reader.result;
 //  }

  // Writes the file details to the realtime db
  private saveFileData(uploadLogEntry: any) {
    this.uploads.push(uploadLogEntry);
  }

}
