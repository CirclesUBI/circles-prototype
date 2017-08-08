import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { NewsService } from '../news-service/news-service';
import { UserService } from '../user-service/user-service';
import { ValidatorService } from '../validator-service/validator-service';

@Injectable()
export class AuthService {

  constructor(
    private newsService: NewsService,
    private userService: UserService,
    private validatorService: ValidatorService
  ) {
    console.log('Hello AuthServiceProvider Provider');
  }

  signOut() {
    this.newsService.signOut();
    this.validatorService.signOut();

    this.userService.signOut().then(
      (user) => {
        console.log('logout success');
        //this.nav.setRoot(LoginPage);
      }, function(error) {
        console.log('logout fail:', error);
      });
  }

}
