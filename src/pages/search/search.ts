import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/first';

import { UserService } from '../../providers/user-service/user-service';
import { ValidatorService } from '../../providers/validator-service/validator-service'

import { ValidatorDetailPage } from '../validator-detail/validator-detail';
import { UserDetailPage } from '../user-detail/user-detail';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  private searchTerm: string = '';
  private search$: Observable<any[]>;
  private searchSubject$: Subject<any[]>;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private validatorService: ValidatorService
  ) {

    this.searchSubject$ = new Subject();
    this.search$ = this.searchSubject$ as Observable<any>;
  }

  // tslint:disable-next-line:no-unused-variable
  private setFilteredItems(): void {
    if (this.searchTerm == '') {
      this.searchSubject$.next([]);
      return;
    }

    let uObs = this.userService.filterUsers$(this.searchTerm);
    let vObs = this.validatorService.filterValidators$(this.searchTerm);
    Observable.combineLatest(uObs, vObs).first().subscribe(
      combined => {
        let search = [];
        for (let obj of combined) {
          if (Array.isArray(obj)) {
            search = search.concat([...obj]);
          }
          else {
            search = search.concat([obj]);
          }
        }
        this.searchSubject$.next(search);
      },
      error => console.log(error),
      () => {}
    )
  }

  // tslint:disable-next-line:no-unused-variable
  private goToDetail(userOrVali): void {
    if (userOrVali.requirements) {
      //validator
      this.navCtrl.push(ValidatorDetailPage, userOrVali);
    }
    else {
      this.navCtrl.push(UserDetailPage, userOrVali);
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

}
