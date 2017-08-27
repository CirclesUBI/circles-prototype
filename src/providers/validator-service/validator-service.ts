import { Injectable } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';

import { UserService } from '../user-service/user-service';
import { User } from '../../interfaces/user-interface';
import { Validator } from '../../interfaces/validator-interface'
import { Provider } from '../../interfaces/provider-interface'

@Injectable()
export class ValidatorService {

  private validatorUsers: Array<User>;
  private user: User;
  public validatorsFirebaseObj$: FirebaseListObservable<Validator[]>;
  public providersFirebaseObj$: FirebaseListObservable<Provider[]>;
  public validators: Array<Validator>;
  public validatorArray: Array<Validator>;
  public initValSubject$: ReplaySubject<any> = new ReplaySubject<any>(1);
  public validators$: Observable<Validator[]>;
  public providers$: Observable<Provider[]>;
  private providers: any;

  public allProviders: {[key: string]: Provider} = {};
  public allValidators: {[key: string]: Validator} = {};
  public userProviders: Array<any>;
  public userValidators: Array<any>;
  public valRequirements: Array<any>;

  private combinedSub$: Subscription;

  constructor(private db: AngularFireDatabase, private userService: UserService) {

    this.validators$ = this.initValSubject$.asObservable();

    this.validatorsFirebaseObj$ = this.db.list('/validators/');
    this.providersFirebaseObj$ = this.db.list('/static/authProviders/');

    const combinator = (user, validators, providers) => {

      this.user = user;
      this.providers = providers;
      this.userProviders = [];

      for (let provider of this.providers) {
        this.allProviders[provider.$key] = provider;
        let p = Object.assign({}, provider) as any;
        if (user.authProviders.find(aKey => provider.$key == aKey)) {
          p.completed = true;
        }
        this.userProviders.push(p);
      }

      this.validators = validators;
      for (let v of this.validators) {
        this.allValidators[v.$key] = v;
      }
      if (this.user.validators) {
        this.userValidators = this.user.validators.map( (vKey:string) => this.keyToValidator(vKey));
        this.validatorUsers = this.userValidators.map( (val:Validator) => {
          return val.trustedUsers.map( (tUserKey) => {
            let u = Object.assign({}, this.userService.keyToUser(tUserKey)) as any;
            u.networkType = 'validator';
            u.image = val.profilePicURL;
            return u;
          })
        }).reduce( (a,b) => {
          return a.concat(b);
        });
        this.userService.addValidatorUsers(this.validatorUsers);
      }
      else {
        this.userValidators = [];
      }
    };

    const userStreams = [this.userService.user$, this.validatorsFirebaseObj$, this.providersFirebaseObj$];
    this.combinedSub$ = Observable.combineLatest(userStreams, combinator).subscribe(
      (result) => console.log('userStreams'),
      (error) => console.log(error),
      () => console.log('userStreams close')
    );
  }

  public getUserProviders(user: User) {
    this.userProviders = [];
    for (let pKey in this.allProviders) {
      let p = Object.assign({}, this.allProviders[pKey]) as any;
      if (user.authProviders.find(aKey => pKey == aKey)) {
        p.completed = true;
      }
      this.userProviders.push(p);
    }
    return this.userProviders;
  }

  public getValidatorRequirements(vali: Validator, user: User) {
    this.valRequirements = [];
    for (let req of vali.requirements) {
      let r = Object.assign({}, this.allProviders[req]) as any;
      if (user.authProviders.find(auth => req == auth)) {
        r.completed = true;
      }
      else {
        r.completed = false;
      }
      this.valRequirements.push(r);
    }
    return this.valRequirements;
  }

  public keyToValidatorName$(key: string): Observable<string> {
    return this.validatorsFirebaseObj$.map(valis => {
      let v = valis.find(vali => vali.$key === key);
      return v.displayName;
    });
  }

  public keyToValidatorName(key: string): string {
    let d = this.allValidators[key];
    //if (!d)
      //todo:error message
    return d.displayName;
  }

  public keyToValidator$(key: string): Observable<Validator> {
    return this.validatorsFirebaseObj$.map(valis => {
      let v = valis.find(vali => vali.$key === key);
      return v;
    });
  }

  public keyToValidator(key: string): Validator {
    let d = this.allValidators[key];
    //if (!d)
      //todo:error message
    return d;
  }

  public keyToProvider(key: string): Provider {
    let d = this.allProviders[key];
    //if (!d)
      //todo:error message
    return d;
  }

  public filterValidators$(searchTerm: string) {
    //if (!searchTerm)
    //  return Observable.empty(); //todo: should this return an observable(false) or something?
    return this.validatorsFirebaseObj$.map((valis) => {
      return valis.filter(vali => {

        if (!vali.displayName || vali.$key == 'undefined')
          return false;
        let s = searchTerm.toLowerCase();
        let d = vali.displayName.toLowerCase();
        return d.indexOf(s) > -1;
      });
    });
  }

  public revokeValidation(user, validator) {
    if (!validator.trustedUsers) {
    //todo:error
    }
    else {
      validator.trustedUsers = validator.trustedUsers.filter(userKey => {
        return userKey !== user.uid;
      });
    }

    if (!user.validators) {
    //todo:error
    }
    else {
      user.validators = user.validators.filter(valiKey => {
        return valiKey !== validator.$key;
      });
    }
  }

  public applyForValidation(user, validator) {
    if (!validator.appliedUsers)
      validator.appliedUsers = [user.uid];
    else
      validator.appliedUsers.push(user.uid);

  }

  public completeValidation(user, validator) {
    if (!validator.appliedUsers) {
    //todo:error
    }
    else {
      validator.appliedUsers = validator.appliedUsers.filter(userKey => {
        return userKey !== user.uid;
      });
    }

    if (!validator.trustedUsers)
      validator.trustedUsers = [user.uid];
    else
      validator.trustedUsers.push(user.uid);

    if (!user.validators)
      user.validators = [validator.$key];
    else
      user.validators.push(validator.$key);

    this.userService.updateUser({validators:user.validators});
  }

  public saveValidator(validator: Validator) {
    this.validatorsFirebaseObj$.update(validator.$key, validator);
  }

  public signOut() {
    if (this.combinedSub$)
      this.combinedSub$.unsubscribe();
  }

}
