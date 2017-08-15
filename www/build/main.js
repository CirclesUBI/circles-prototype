webpackJsonp([0],{

/***/ 17:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angularfire2_auth__ = __webpack_require__(165);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_firebase_app__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_firebase_app___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_firebase_app__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_ReplaySubject__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_ReplaySubject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_ReplaySubject__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_find__ = __webpack_require__(340);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_find___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_find__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_map__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_map__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};








let UserService = class UserService {
    constructor(afAuth, db) {
        this.afAuth = afAuth;
        this.db = db;
        this.initUserSubject$ = new __WEBPACK_IMPORTED_MODULE_5_rxjs_ReplaySubject__["ReplaySubject"](1);
        this.usersSubject$ = new __WEBPACK_IMPORTED_MODULE_5_rxjs_ReplaySubject__["ReplaySubject"](1);
        this.users$ = this.usersSubject$.asObservable();
        this.user = {};
        this.userSubject$ = new __WEBPACK_IMPORTED_MODULE_5_rxjs_ReplaySubject__["ReplaySubject"](1);
        this.weeklyGrant = 100;
        this.myCoins = {};
        this.user.createdAt = 0;
        this.authState$ = this.afAuth.authState;
        this.usersFirebaseList$ = this.db.list('/users/');
        this.usersSub$ = this.usersFirebaseList$.subscribe(users => {
            this.users = [];
            for (let u of users) {
                this.users[u.$key] = u.userData;
            }
            this.usersSubject$.next(users);
        }, error => console.log('Could not load users.'));
        this.initUserSubject$.take(1).subscribe(initUser => {
            if (!this.isOrg(initUser))
                this.type = 'individual';
            else
                this.type = 'organisation';
            this.user$ = this.userSubject$.asObservable();
            this.userFirebaseObj$ = this.db.object('/users/' + initUser.uid + '/userData');
            this.userSub$ = this.userFirebaseObj$.subscribe(user => {
                this.user = user;
                this.setBalance(user);
                this.userSubject$.next(this.user);
            }, error => console.log('Could not load current user record.'));
            this.combinedSub$ = __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["Observable"].combineLatest(this.userFirebaseObj$, this.usersFirebaseList$).subscribe((result) => {
                let user = result[0];
                let users = result[1];
                if (!this.users) {
                    this.users = [];
                    for (let u of users) {
                        this.users[u.$key] = u.userData;
                    }
                    this.usersSubject$.next(users);
                }
                if (user.trustedUsers) {
                    this.trustedUsers = user.trustedUsers.map((uKey) => this.keyToUser(uKey));
                }
            });
        }, error => console.log(error), () => { });
    }
    createAuthUser(email, password) {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    }
    createCirclesUser(formUser) {
        formUser.createdAt = __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'];
        if (!formUser.authProviders) {
            formUser.authProviders = ["email", "name"];
        }
        else {
            formUser.authProviders.push("email");
            formUser.authProviders.push("name");
        }
        formUser.agreedToDisclaimer = false;
        if (!this.isOrg(formUser)) {
            formUser.displayName = formUser.firstName + ' ' + formUser.lastName;
            this.user = this.setInitialWallet(formUser);
        }
        else {
            this.user = formUser;
        }
        return this.user;
    }
    keyToUser$(key) {
        return this.users$.map(users => users.find(user => user.uid === key).userData);
    }
    keyToUser(key) {
        let u = this.users[key];
        if (!u)
            console.log('Error: missing user ' + key);
        return u;
    }
    keyToUserName$(key) {
        return this.users$.map(users => {
            let u = users.find(user => user.uid === key);
            return u.displayName;
        });
    }
    keyToUserName(key) {
        let d = this.users[key];
        if (!d)
            console.log('Error: missing user ' + key);
        return d.displayName;
    }
    filterUsers$(searchTerm) {
        //if (!searchTerm)
        //  return Observable.empty(); //todo: should this return an observable(false) or something?
        return this.users$.map((users) => {
            users = users.map((userRecord) => {
                return userRecord.userData;
            });
            let ret = users.filter((user) => {
                //let user = userRecord.userData as User;
                if (!user || !user.displayName || user.displayName == '' || user.uid == 'undefined' || (user.uid == this.user.uid))
                    return false;
                let s = searchTerm.toLowerCase();
                let d = user.displayName.toLowerCase();
                return d.indexOf(s) > -1;
            });
            return ret;
        });
    }
    signInEmail(email, password) {
        return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    }
    signInRedirect(provider) {
        return this.afAuth.auth.signInWithRedirect(provider);
    }
    addTrustedUser(userKey) {
        if (this.user.trustedUsers)
            this.user.trustedUsers.push(userKey);
        else
            this.user.trustedUsers = [userKey];
        this.updateUser({ trustedUsers: this.user.trustedUsers });
    }
    removeTrustedUser(userKey) {
        this.user.trustedUsers = this.user.trustedUsers.filter(user => {
            return user != userKey;
        });
        this.updateUser({ trustedUsers: this.user.trustedUsers });
    }
    setInitialWallet(user) {
        let now = new Date();
        let day = now.getDay();
        let diff = (7 - 5 + day) % 7;
        let b = this.weeklyGrant - ((this.weeklyGrant / 7) * (diff));
        this.myCoins.amount = Math.round(b);
        this.myCoins.owner = user.uid;
        this.myCoins.title = (user.firstName) ? user.firstName + ' Coin' : 'Circle Coin';
        //my coins start at the highest priority
        this.myCoins.priority = 0;
        this.myCoins.createdAt = now.getTime();
        this.allCoins = {
            [user.uid]: this.myCoins
        };
        user.wallet = this.allCoins;
        this.setBalance(user);
        return user;
    }
    setBalance(user) {
        let total = 0;
        for (let i in user.wallet) {
            total += user.wallet[i].amount;
        }
        user.balance = total;
    }
    signOut() {
        //todo: better way to do this?
        if (this.userSub$)
            this.userSub$.unsubscribe();
        if (this.usersSub$)
            this.usersSub$.unsubscribe();
        if (this.combinedSub$)
            this.combinedSub$.unsubscribe();
        return this.afAuth.auth.signOut();
    }
    clearUser() {
        let blankUser = {};
        this.user = blankUser;
        // if (this.userSubject$) {
        //   this.userSubject$.next(blankUser);
        // }
    }
    updateUser(updateObject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.userFirebaseObj$.update(updateObject);
                console.log('updateUser success');
            }
            catch (error) {
                console.error(error);
                throw new Error("userService updateUser fail");
            }
        });
    }
    saveUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.userFirebaseObj$.set(this.user);
                console.log('saveUser success');
            }
            catch (error) {
                console.error(error);
                throw new Error("userService saveUser fail");
            }
        });
    }
    isOrg(user) {
        return user.address !== undefined;
    }
    ngOnDestroy() {
        this.userSub$.unsubscribe();
        this.usersSub$.unsubscribe();
    }
};
UserService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_angularfire2_auth__["a" /* AngularFireAuth */],
        __WEBPACK_IMPORTED_MODULE_1_angularfire2_database__["a" /* AngularFireDatabase */]])
], UserService);

//# sourceMappingURL=user-service.js.map

/***/ }),

/***/ 177:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular2_notifications__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular2_notifications___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular2_notifications__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_validator_service_validator_service__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__search_search__ = __webpack_require__(346);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__user_detail_user_detail__ = __webpack_require__(191);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__validator_detail_validator_detail__ = __webpack_require__(178);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};











let HomePage = class HomePage {
    constructor(navCtrl, navParams, notificationsService, db, ds, toastCtrl, userService, newsService, validatorService) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.notificationsService = notificationsService;
        this.db = db;
        this.ds = ds;
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.newsService = newsService;
        this.validatorService = validatorService;
        this.selectedView = 'network';
        this.view = 'network';
        this.networkList = [];
        this.newsList = [];
        this.validatorList = [];
    }
    openSearch() {
        console.log("clicked openSearch");
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_8__search_search__["a" /* SearchPage */]);
    }
    goToUserDetail(user) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_9__user_detail_user_detail__["a" /* UserDetailPage */], user);
    }
    goToValidatorDetail(validator) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_10__validator_detail_validator_detail__["a" /* ValidatorDetailPage */], validator);
    }
    selectNetwork() {
        this.selectedView = 'network';
    }
    selectNews() {
        this.selectedView = 'news';
    }
    selectValidators() {
        this.selectedView = 'validators';
    }
    ionViewDidLoad() {
        this.userSub$ = this.userService.user$.subscribe(user => {
            if (!user.agreedToDisclaimer) {
                //if they got this far then they have agreed to the disclaimer
                this.userService.updateUser({ agreedToDisclaimer: true });
            }
            if (this.userService.type === 'organisation') {
                this.user = user;
            }
            else {
                this.user = user;
                this.myCoinName = user.wallet[user.uid].title;
                this.myCoinBalance = user.wallet[user.uid].amount;
                this.allCoinBalance = user.balance;
            }
        });
    }
};
HomePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-home',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar color="secondary">\n    <!--<ion-title></ion-title>-->\n    <ion-buttons left>\n      <a menuToggle icon-only>\n        <ion-icon name="menu"></ion-icon>\n      </a>\n    </ion-buttons>\n    <ion-buttons right>\n      <div (click)="openSearch()">\n        <a icon-only>\n          <ion-icon name="search"></ion-icon>\n        </a>\n      </div>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding id="home-content">\n\n  <span ion-fixed class="home-fixed" style="">\n\n    <div class="home-pic">\n      <div class="circle-crop"\n        [ngStyle]="{\'background-image\': \'url(\' + user?.profilePicURL + \')\'}">\n      </div>\n\n      <div class="user-name">\n        {{user?.displayName}}\n      </div>\n\n      <div>{{user?.greeting}}</div>\n\n      <div class="balance">\n        {{user?.balance}} css\n      </div>\n\n    </div>\n\n    <!-- segment btns -->\n    <div class="segment-btns">\n      <ion-segment [(ngModel)]="view" color="primary">\n        <ion-segment-button class="offer-segment-button" value="network" (ionSelect)="selectNetwork()">\n          Network\n        </ion-segment-button>\n        <ion-segment-button class="offer-segment-button" value="wants" (ionSelect)="selectNews()">\n          News\n        </ion-segment-button>\n        <ion-segment-button class="offer-segment-button" value="validators" (ionSelect)="selectValidators()">\n          Validators\n        </ion-segment-button>\n      </ion-segment>\n    </div>\n\n    <div id="balance-detail" *ngIf="userService.type == \'organisation\'">\n      <div class="received">\n        <h1>Circles Received</h1>\n        <h2>0</h2>\n      </div>\n      <div class="sent">\n        <h1>Circles Sent</h1>\n        <h2>0</h2>\n      </div>\n    </div>\n    <div id="balance-detail" *ngIf="userService.type == \'individual\'">\n      <div class="received">\n        <h1>My Coins Balance</h1>\n        <h2>{{myCoinBalance}} {{myCoinName}}</h2>\n      </div>\n      <div class="sent">\n        <h1>All Coins Balance</h1>\n        <h2>{{allCoinBalance}} Circles</h2>\n      </div>\n    </div>\n\n    <ion-content overflow-scroll="true" class="scrolling-list">\n\n      <!-- NETWORK LIST -->\n      <span *ngIf="selectedView == \'network\'">\n        <ion-item *ngFor="let networkUser of userService.trustedUsers" (click)="goToUserDetail(networkUser)">\n          <ion-avatar style="width:48px;height:48px" item-left>\n            <img src="{{networkUser.profilePicURL}}">\n          </ion-avatar>\n          <h2>{{networkUser.displayName}}</h2>\n          <p>{{networkUser.greeting}}</p>\n        </ion-item>\n        <!-- placeholder text -->\n        <div *ngIf="!userService.trustedUsers" class="disclaimer">\n          There\'s nobody in your network...yet!<br>\n          Tap the search icon <ion-icon name="search"></ion-icon> in the top-right of the screen to build your network.\n        </div>\n      </span>\n\n      <!-- NEWs LIST -->\n      <span *ngIf="selectedView == \'news\'">\n        <news-card [newsItem]="newsItem" *ngFor="let newsItem of newsService.allnewsItemsReversed$ | async"></news-card>\n      </span>\n\n      <!-- VALIDATORS list -->\n      <span *ngIf="selectedView == \'validators\'">\n        <ion-item *ngFor="let validator of validatorService.userValidators" (click)="goToValidatorDetail(validator)">\n          <ion-avatar style="width:48px;height:48px" item-left>\n            <img src="{{validator?.profilePicURL}}">\n          </ion-avatar>\n          <h2>{{validator?.displayName}}</h2>\n          <p>{{validator?.description}}</p>\n        </ion-item>\n        <!-- placeholder text -->\n        <div *ngIf="validatorService.userValidators.length == 0" class="disclaimer">\n          Nobody has validated you yet.<br>\n          Tap the search icon <ion-icon name="search"></ion-icon> in the top-right of the screen to build your network.\n        </div>\n      </span>\n    </ion-content>\n\n  </span>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/home/home.html"*/,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2_angular2_notifications__["NotificationsService"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2_angular2_notifications__["NotificationsService"]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_4_angularfire2_database__["a" /* AngularFireDatabase */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4_angularfire2_database__["a" /* AngularFireDatabase */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["DomSanitizer"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["DomSanitizer"]) === "function" && _e || Object, typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */]) === "function" && _f || Object, typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_5__providers_user_service_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__providers_user_service_user_service__["a" /* UserService */]) === "function" && _g || Object, typeof (_h = typeof __WEBPACK_IMPORTED_MODULE_6__providers_news_service_news_service__["a" /* NewsService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__providers_news_service_news_service__["a" /* NewsService */]) === "function" && _h || Object, typeof (_j = typeof __WEBPACK_IMPORTED_MODULE_7__providers_validator_service_validator_service__["a" /* ValidatorService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_7__providers_validator_service_validator_service__["a" /* ValidatorService */]) === "function" && _j || Object])
], HomePage);

var _a, _b, _c, _d, _e, _f, _g, _h, _j;
//# sourceMappingURL=home.js.map

/***/ }),

/***/ 178:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ValidatorDetailPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_apply_apply__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_validator_service_validator_service__ = __webpack_require__(46);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






let ValidatorDetailPage = class ValidatorDetailPage {
    constructor(navCtrl, navParams, userService, newsService, validatorService) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.userService = userService;
        this.newsService = newsService;
        this.validatorService = validatorService;
        this.validator = {};
        this.trusted = false;
        this.applied = false;
        this.validator = navParams.data;
    }
    revokeTrust() {
        this.validator.trustedUsers.filter(user => user !== this.user.uid);
        this.trusted = false;
        this.validatorService.revokeValidation(this.user, this.validator);
        this.newsService.revokeValidatorTrust(this.validator);
        this.userService.saveUser();
        this.validatorService.saveValidator(this.validator);
    }
    checkRequirements() {
        let rqs = this.validatorService.getValidatorRequirements(this.validator, this.user);
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__pages_apply_apply__["a" /* ApplyPage */], { validator: this.validator, user: this.user, reqs: rqs });
    }
    ionViewDidLoad() {
        this.userSub$ = this.userService.user$.subscribe(user => {
            this.user = user;
            this.trustedUsers = [];
            this.trusted = false;
            this.applied = false;
            if (this.user.validators) {
                for (let vKey of this.user.validators) {
                    if (this.validator.$key == vKey)
                        this.trusted = true;
                }
            }
            if (this.validator.trustedUsers) {
                for (let tUserKey of this.validator.trustedUsers) {
                    let u = this.userService.users[tUserKey];
                    this.trustedUsers.push(u);
                }
            }
            if (this.validator.appliedUsers) {
                if (this.validator.appliedUsers.find(u => u === this.user.uid)) {
                    this.applied = true;
                }
            }
        });
    }
};
ValidatorDetailPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-validator-detail',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/validator-detail/validator-detail.html"*/'validator\n<ion-header>\n\n  <ion-navbar>\n    <ion-title></ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n<ion-content padding>\n  <ion-card class="shadowless-card">\n    <ion-card-title>\n      <h1>{{validator.displayName}}</h1>\n      <ion-badge *ngIf="trusted">Validated</ion-badge>\n      <h2>{{validator.greeting}}</h2>\n    </ion-card-title>\n    <ion-card-content>\n     <img src="{{validator.profilePicURL}}">\n     <span *ngIf="directTrust">\n       <ion-avatar style="width:48px;height:48px" item-center>\n         <img src="{{user.profilePicURL || genericProfilePicURL}}">\n       </ion-avatar>\n     </span>\n      <ion-list no-lines>\n        <ion-item>\n          <ion-icon name="mail" item-left></ion-icon>\n          <p>{{validator.email}}</p>\n        </ion-item>\n\n        <ion-card style="margin:12px 0;width:100%">\n        <ion-card-header>\n            Description\n          </ion-card-header>\n          <ion-card-content>\n            {{validator.description}}\n          </ion-card-content>\n        </ion-card>\n        <div class="horizontal-center-wrapper">\n          <button ion-button *ngIf="!trusted && !applied" (click)="checkRequirements()" icon-end>\n            Check Validator Requirements\n            <ion-icon name="unlock" item-right></ion-icon>\n          </button>\n          <button ion-button *ngIf="!trusted && applied" disabled outline icon-end>\n            Application Pending\n            <ion-icon name="time" item-right></ion-icon>\n          </button>\n          <button ion-button *ngIf="trusted" (click)="revokeTrust()" icon-end>\n            Revoke Trust Validation\n            <ion-icon name="unlock" item-right>\n            </ion-icon>\n          </button>\n        </div>\n        <ion-item *ngIf="this.trusted">\n          <ion-icon name="people" item-left></ion-icon>\n          <ion-grid>\n        		<ion-row>\n        			<ion-col *ngFor="let u of trustedUsers">\n                <ion-avatar style="width:48px;height:48px">\n                  <img src="{{u.profilePicURL}}">\n                </ion-avatar>\n              </ion-col>\n            </ion-row>\n          </ion-grid>\n        </ion-item>\n      </ion-list>\n    </ion-card-content>\n  </ion-card>\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/validator-detail/validator-detail.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_3__providers_news_service_news_service__["a" /* NewsService */],
        __WEBPACK_IMPORTED_MODULE_5__providers_validator_service_validator_service__["a" /* ValidatorService */]])
], ValidatorDetailPage);

//# sourceMappingURL=validator-detail.js.map

/***/ }),

/***/ 179:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProfilePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_firebase_storage__ = __webpack_require__(494);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_firebase_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_firebase_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Observable__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_validator_service_validator_service__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__providers_storage_service_storage_service__ = __webpack_require__(185);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









let ProfilePage = class ProfilePage {
    constructor(db, ds, loadingCtrl, navCtrl, sanitizer, storageService, toastCtrl, userService, validatorService) {
        this.db = db;
        this.ds = ds;
        this.loadingCtrl = loadingCtrl;
        this.navCtrl = navCtrl;
        this.sanitizer = sanitizer;
        this.storageService = storageService;
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.validatorService = validatorService;
        this.user = {};
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad ProfilePage');
        this.userSub$ = this.userService.user$.subscribe(user => {
            this.user = user;
            if (this.user.profilePicURL) {
                this.profilePicURL = this.user.profilePicURL;
            }
            this.providers = this.validatorService.userProviders;
        });
    }
    fileChangeEvent(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = (e) => {
                let img = new Image;
                img.src = reader.result;
                img.onload = ((file) => {
                    this.storageService.resizePicFile(fileInput.target.files, img.height, img.width).subscribe(imageBlob => {
                        this.profilePicURL = URL.createObjectURL(imageBlob);
                        this.base64ImageData = this.profilePicURL.substring(23);
                        this.profilePicUpload = new __WEBPACK_IMPORTED_MODULE_8__providers_storage_service_storage_service__["b" /* UploadFile */](imageBlob, this.user.uid);
                    });
                });
            };
            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }
    fileUpload() {
        this.loading = this.loadingCtrl.create({
            content: 'Uploading ...',
        });
        this.loading.present();
        let progressIntervalObs$ = __WEBPACK_IMPORTED_MODULE_5_rxjs_Observable__["Observable"].interval(200).subscribe(() => {
            this.loading.data.content = this.sanitizer.bypassSecurityTrustHtml('<p>Saving Profile ...</p><progress value="' + this.profilePicUpload.progress + '" max="100"></progress>');
        });
        this.storageService.uploadFile(this.profilePicUpload).then((profileURL) => {
            this.user.profilePicURL = profileURL;
            progressIntervalObs$.unsubscribe();
            this.loading.dismiss();
            this.userService.updateUser({ profilePicURL: this.user.profilePicURL });
        }, (error) => {
            progressIntervalObs$.unsubscribe();
            this.toast = this.toastCtrl.create({
                message: error.message + ': ' + error.details,
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.toast.present();
        });
    }
    saveProfile() {
        if (this.userService.type == 'individual') {
            let u = this.user;
            this.user.displayName = u.firstName + ' ' + u.lastName;
        }
        else {
        }
        this.userService.saveUser();
        this.navCtrl.pop();
    }
    gotoProvider(prov) {
        if (prov.completed)
            return;
    }
};
ProfilePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-profile',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/profile/profile.html"*/'<ion-header>\n  <ion-navbar color="secondary">\n    <ion-title>Update Profile</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n\n  <ion-row>\n    <ion-col>\n\n      <form (ngSubmit)="saveProfile()">\n        <!-- First Name -->\n        <span *ngIf="userService.type == \'individual\'">\n          <ion-item>\n            <ion-label stacked>First Name</ion-label>\n            <ion-input type="text" [(ngModel)]="user.firstName" name="firstname"></ion-input>\n          </ion-item>\n\n          <!-- Last Name -->\n          <ion-item>\n            <ion-label stacked>Last Name</ion-label>\n            <ion-input type="text" [(ngModel)]="user.lastName" name="lastname"></ion-input>\n          </ion-item>\n        </span>\n\n        <span *ngIf="userService.type == \'organisation\'">\n          <ion-item>\n            <ion-label stacked>Organisation Name</ion-label>\n            <ion-input type="text" [(ngModel)]="user.displayName" name="firstname"></ion-input>\n          </ion-item>\n        </span>\n\n        <!-- Greeting -->\n        <ion-item>\n          <ion-label stacked>Greeting</ion-label>\n          <ion-input type="text" [(ngModel)]="user.greeting" name="title"></ion-input>\n        </ion-item>\n\n        <ion-item>\n          <ion-label stacked>Profile Picture</ion-label>\n          <!-- <div class="circle-crop" [ngStyle]="{\'background-image\': \'url(\' + profilePicURL + \')\'}"> -->\n            <div item-content>\n              <img [src]="sanitizer.bypassSecurityTrustResourceUrl(profilePicURL)">\n            </div>\n        </ion-item>\n        <input ion-input *ngIf="storageService.isUploadSupported()" (change)="fileChangeEvent($event)" id="file" type="file" accept="image/*">\n        <button ion-button type="button" *ngIf="this.base64ImageData" (click)="fileUpload()">Upload Photo</button>\n        <ion-item>\n          <ion-label stacked>Trade Message</ion-label>\n          <ion-input type="text" [(ngModel)]="user.tradeMessage" name="title"></ion-input>\n        </ion-item>\n\n        <ion-item id="auth-providers">\n          <ion-label stacked>Authentication Providers</ion-label>\n          <div item-content>\n            <span *ngFor="let provider of providers" (click)="gotoProvider(provider)">\n              <button type="button" ion-button outline *ngIf="!provider.completed">\n                <ion-icon name="{{provider.icon}}"></ion-icon>\n                {{provider.displayName}}\n              </button>\n              <button type="button" ion-button *ngIf="provider.completed">\n                <ion-icon name="{{provider.icon}}"></ion-icon>\n                {{provider.displayName}}\n              </button>\n            </span>\n          </div>\n        </ion-item>\n        <button ion-button type="submit" block>Save</button>\n\n\n      </form>\n\n    </ion-col>\n  </ion-row>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/profile/profile.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3_angularfire2_database__["a" /* AngularFireDatabase */],
        __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__["DomSanitizer"],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__["DomSanitizer"],
        __WEBPACK_IMPORTED_MODULE_8__providers_storage_service_storage_service__["a" /* StorageService */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_6__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_7__providers_validator_service_validator_service__["a" /* ValidatorService */]])
], ProfilePage);

//# sourceMappingURL=profile.js.map

/***/ }),

/***/ 185:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StorageService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ng2_pica__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_firebase_app__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_firebase_app___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_firebase_app__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_Subject__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_Subject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_Subject__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};







class Upload {
    constructor() {
        this.createdAt = new Date();
    }
}
/* unused harmony export Upload */

class UploadImage extends Upload {
    constructor(base64String, owner) {
        super();
        this.owner = owner;
        this.base64String = base64String;
    }
}
/* unused harmony export UploadImage */

class UploadFile extends Upload {
    constructor(file, owner) {
        super();
        this.owner = owner;
        this.file = file;
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = UploadFile;

let StorageService = class StorageService {
    constructor(db, pica, toastCtrl) {
        this.db = db;
        this.pica = pica;
        this.toastCtrl = toastCtrl;
        this.progressSubject$ = new __WEBPACK_IMPORTED_MODULE_6_rxjs_Subject__["Subject"](); //3 should add smoothing?!?
        this.profilePicRef = __WEBPACK_IMPORTED_MODULE_3_firebase_app__["storage"]().ref('/profilepics');
        this.progress$ = this.progressSubject$.asObservable();
        this.uploads = this.db.list('/uploads');
    }
    resizeAndUploadProfilePic(upload) {
        return this.resizeProfilePic(upload, 1024, 768).then(uploadResized => {
            return this.uploadFile(uploadResized);
        });
    }
    resizePicFile(files, sourceHeight, sourceWidth) {
        let fileList = Array.from(files);
        let maxHeight = 1024;
        let maxWidth = 768;
        let h, w;
        if (sourceHeight > sourceWidth) {
            let ratio = maxHeight / sourceHeight;
            h = maxHeight;
            w = sourceWidth * ratio;
        }
        else if (sourceWidth >= sourceHeight) {
            let ratio = maxWidth / sourceWidth;
            w = maxWidth;
            h = sourceHeight * ratio;
        }
        return this.pica.resize(fileList, w, h);
    }
    resizeProfilePic(upload, maxHeight, maxWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let img = new Image;
                img.src = upload.base64String;
                img.onload = ((file) => {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    let h, w;
                    ctx.drawImage(img, 0, 0);
                    if (img.height > img.width) {
                        let ratio = img.width / img.height;
                        h = maxHeight;
                        w = img.width * ratio;
                    }
                    else if (img.width >= img.height) {
                        let ratio = img.height / img.width;
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
                        .then(result => {
                    });
                    resolve(upload);
                });
                img.onerror = ((error) => {
                    let err = { details: error, message: 'Error loading as image' };
                    reject(err);
                });
            });
        });
    }
    uploadFile(upload) {
        return __awaiter(this, void 0, void 0, function* () {
            let uploadTask;
            if (upload instanceof UploadImage) {
                let c = this.profilePicRef.child(upload.owner + '.jpg');
                uploadTask = c.putString(upload.base64String, 'base64', { contentType: 'image/jpg' });
            }
            else if (upload instanceof UploadFile) {
                let c = this.profilePicRef.child(upload.owner + '.jpg');
                uploadTask = c.put(upload.file);
            }
            return new Promise((resolve, reject) => {
                uploadTask.on(__WEBPACK_IMPORTED_MODULE_3_firebase_app__["storage"].TaskEvent.STATE_CHANGED, (snapshot) => {
                    upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + upload.progress + '% done');
                    switch (snapshot.state) {
                        case __WEBPACK_IMPORTED_MODULE_3_firebase_app__["storage"].TaskState.PAUSED:
                            console.log('Upload is paused');
                            break;
                        case __WEBPACK_IMPORTED_MODULE_3_firebase_app__["storage"].TaskState.RUNNING:
                            console.log('Upload is running');
                            break;
                    }
                }, (error) => {
                    let err = { details: error, message: 'Error uploading image' };
                    reject(err);
                }, () => {
                    // Upload completed successfully, now we can get the download URL
                    console.log('Upload Complete');
                    //upload.progress = 100;
                    let uploadLogEntry = {
                        createdAt: upload.createdAt,
                        name: uploadTask.snapshot.metadata.name,
                        size: uploadTask.snapshot.metadata.size,
                        url: uploadTask.snapshot.downloadURL
                    };
                    this.saveFileData(uploadLogEntry);
                    resolve(uploadTask.snapshot.downloadURL);
                });
            });
        });
    }
    isUploadSupported() {
        if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
            return false;
        }
        var elem = document.createElement('input');
        elem.type = 'file';
        return !elem.disabled;
    }
    // Writes the file details to the realtime db
    saveFileData(uploadLogEntry) {
        this.uploads.push(uploadLogEntry);
    }
};
StorageService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_4_angularfire2_database__["a" /* AngularFireDatabase */],
        __WEBPACK_IMPORTED_MODULE_2_ng2_pica__["b" /* Ng2PicaService */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */]])
], StorageService);

//# sourceMappingURL=storage-service.js.map

/***/ }),

/***/ 190:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ConfirmModal; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


let ConfirmModal = class ConfirmModal {
    constructor(navParams, viewCtrl) {
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.message = navParams.get('message');
        this.title = navParams.get('title');
    }
    confirm(decision) {
        this.viewCtrl.dismiss(decision).catch((err) => console.log('view was not dismissed: ' + err));
        ;
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad ConfirmModalPage');
    }
};
ConfirmModal = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-confirm-modal',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/confirm-modal/confirm-modal.html"*/'<!--\n  Generated template for the ConfirmModalPage page.\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n  Ionic pages and navigation.\n-->\n<ion-header>\n\n  <ion-navbar>\n    <ion-title>{{title}}</ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n  <h1>{{message}}</h1>\n  <button ion-button color="danger" (click)="confirm(false)">\n  Cancel\n  </button>\n<!-- disable if the user is the seller, can\'t buy your own stuff! -->\n<button ion-button color="green" (click)="confirm(true)">\n  Confirm\n</button>\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/confirm-modal/confirm-modal.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* ViewController */]])
], ConfirmModal);

//# sourceMappingURL=confirm-modal.js.map

/***/ }),

/***/ 191:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserDetailPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_transaction_service_transaction_service__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_validator_service_validator_service__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__send_send__ = __webpack_require__(380);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







let UserDetailPage = class UserDetailPage {
    constructor(navCtrl, navParams, userService, newsService, transactionService, validatorService) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.userService = userService;
        this.newsService = newsService;
        this.transactionService = transactionService;
        this.validatorService = validatorService;
        this.user = {};
        this.trustTo = false;
        this.trustFrom = false;
        this.validatorTrust = false;
        this.trusted = false;
        this.validatedBy = {};
        this.viewUser = navParams.data;
        console.log(navParams.data);
    }
    revokeTrust() {
        this.newsService.revokeUserTrust(this.viewUser);
        this.userService.removeTrustedUser(this.viewUser.uid);
    }
    affordTrust() {
        this.newsService.addTrust(this.viewUser);
        this.userService.addTrustedUser(this.viewUser.uid);
    }
    sendCircles() {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__send_send__["a" /* SendPage */], this.viewUser);
    }
    ionViewDidLoad() {
        this.userSub$ = this.userService.user$.subscribe(user => {
            this.user = user;
            if (this.viewUser.profilePicURL)
                this.profilePicURL = this.viewUser.profilePicURL;
            if (this.user.trustedUsers) {
                this.trustTo = this.user.trustedUsers.some(tUserKey => {
                    return tUserKey == this.viewUser.uid;
                });
            }
            if (this.viewUser.trustedUsers) {
                this.trusted = this.trustFrom = this.viewUser.trustedUsers.some(tUserKey => {
                    return tUserKey == this.user.uid;
                });
            }
        });
    }
};
UserDetailPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-user-detail',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/user-detail/user-detail.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title></ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n<ion-content padding>\n  <ion-card class="shadowless-card">\n    <ion-card-title>\n      <h1>{{viewUser.displayName}}</h1>\n      <h2>{{viewUser.greeting}}</h2>\n    </ion-card-title>\n    <ion-card-content style="padding: 0;">\n       <img src="{{profilePicURL}}">\n       <span>\n         <div class="center-wrapper" *ngIf="(trustTo&&!trustFrom)||validatorTrust">\n           <div class="center-item"><span class="arrow">↑</span></div>\n           <div class="center-text" *ngIf="!validatorTrust">You trust</div>\n           <div class="center-text" *ngIf="validatorTrust">Trusts them</div>\n         </div>\n\n         <div class="center-wrapper" *ngIf="validatorTrust">\n           <ion-avatar class="center-item" style="width:85px;" item-center>\n             <img src="{{validatedBy.profilePicURL}}">\n            </ion-avatar>\n         </div>\n\n         <div class="center-wrapper" *ngIf="(trustFrom&&!trustTo)||validatorTrust">\n           <div class="center-item"><span class="arrow">↓</span></div>\n           <div class="center-text">Trusts you</div>\n         </div>\n\n         <div class="center-wrapper" *ngIf="(trustFrom&&trustTo)&&!validatorTrust">\n           <div class="center-item"><span class="arrow">↕</span></div>\n           <div class="center-text">Trust each other</div>\n         </div>\n\n         <div class="center-wrapper" *ngIf="trustTo||trustFrom||validatorTrust">\n            <ion-avatar class="center-item" style="width:85px;" item-center>\n              <img src="{{user.profilePicURL || genericProfilePicURL}}">\n           </ion-avatar>\n         </div>\n       </span>\n       <ion-list no-lines>\n         <ion-item *ngIf="viewUser.email">\n           <ion-icon name="mail" item-left></ion-icon>\n           <p>{{viewUser.email}}</p>\n         </ion-item>\n\n         <ion-item *ngIf="viewUser.phoneNum">\n           <ion-icon name="phone-portrait" item-left></ion-icon>\n           {{viewUser.phoneNum}}\n         </ion-item>\n\n       </ion-list>\n\n       <ion-card *ngIf="viewUser.tradeMessage" style="margin:12px 0;width:100%">\n        <ion-card-header>\n          Trade Message\n        </ion-card-header>\n        <ion-card-content>\n          {{viewUser.tradeMessage}}\n        </ion-card-content>\n      </ion-card>\n\n\n      <button ion-button full *ngIf="!trustTo" (click)="affordTrust()" icon-end>\n          Afford Trust\n         <ion-icon name="lock" color="red">\n         </ion-icon>\n      </button>\n\n      <button ion-button full *ngIf="trustTo" (click)="revokeTrust()" icon-end>\n        Revoke Trust\n        <ion-icon name="unlock" color="green" item-right>\n        </ion-icon>\n      </button>\n\n      <button ion-button full [disabled]="!trusted"  (click)="sendCircles()" icon-end>\n        Send Circles\n        <ion-icon name="send">\n        </ion-icon>\n      </button>\n\n     </ion-card-content>\n   </ion-card>\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/user-detail/user-detail.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_3__providers_news_service_news_service__["a" /* NewsService */],
        __WEBPACK_IMPORTED_MODULE_4__providers_transaction_service_transaction_service__["a" /* TransactionService */],
        __WEBPACK_IMPORTED_MODULE_5__providers_validator_service_validator_service__["a" /* ValidatorService */]])
], UserDetailPage);

//# sourceMappingURL=user-detail.js.map

/***/ }),

/***/ 192:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TransactionService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_firebase_app__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_firebase_app___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_firebase_app__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};







let TransactionService = class TransactionService {
    constructor(db, newsService, userService) {
        this.db = db;
        this.newsService = newsService;
        this.userService = userService;
        this.transact = new __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__["Subject"]();
        this.userSub$ = this.userService.user$.subscribe(user => this.user = user, error => console.error(error), () => console.log('transaction-service constructor userSub$ obs complete'));
        this.transactionLog$ = this.db.list('/transactions/');
    }
    transfer(toUser, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            amount = Number(amount);
            let sentCoins = [];
            let trusted = this.getTrustIntersection(this.user, toUser);
            if (trusted.balance < amount) {
                //we don't have enough trusted coins
                return false;
            }
            for (let coin of trusted.trustedCoins) {
                if (amount > coin.amount) {
                    let c = Object.assign({}, coin);
                    ;
                    sentCoins[coin.owner] = c;
                    coin.amount = 0;
                }
                else {
                    let c = Object.assign({}, coin);
                    c.amount = amount;
                    sentCoins[coin.owner] = c;
                    coin.amount -= amount;
                }
            }
            this.user.balance -= amount;
            //now we need to update the other wallet
            toUser.balance += amount;
            for (let key in sentCoins) {
                if (toUser.wallet[key]) {
                    toUser.wallet[key].amount += sentCoins[key].amount;
                }
                else {
                    toUser.wallet[key] = sentCoins[key];
                }
            }
            try {
                yield this.db.object('/users/' + toUser.uid + '/userData').update({
                    wallet: toUser.wallet,
                    balance: toUser.balance
                });
            }
            catch (error) {
                console.error(error);
                throw new Error("Send fail");
            }
            return true;
        });
    }
    logTransfer(toUser, amount) {
        let logItem = {
            "from": this.user.uid,
            "to": toUser.uid,
            "timestamp": __WEBPACK_IMPORTED_MODULE_2_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            "amount": amount
        };
        //add to the main transaction log
        this.transactionLog$.push(logItem);
    }
    createTransactionIntent(toUserId, amount, message) {
        let p = new Promise((resolve, reject) => {
            let toUser = this.userService.keyToUser(toUserId);
            if (this.transfer(toUser, amount)) {
                this.logTransfer(toUser, amount);
                this.newsService.addTransaction(toUser, amount, message);
                resolve(true);
            }
            else
                reject(new Error("Transfer Failed"));
        });
        return p;
    }
    //which of the receivingUser's trusted coins does the sendingUser have?
    getTrustIntersection(sendingUser, receivingUser) {
        let returnArray = [];
        let sum = 0;
        let rTrusts = receivingUser.trustedUsers;
        if (receivingUser.trustedUsers) {
            for (let tUserKey of rTrusts) {
                if (sendingUser.wallet[tUserKey]) {
                    sum += this.user.wallet[tUserKey].amount;
                    let p = this.user.wallet[tUserKey].priority;
                    returnArray[p] = this.user.wallet[tUserKey];
                }
            }
        }
        return { trustedCoins: returnArray, balance: sum };
    }
    ngOnDestroy() {
        this.userSub$.unsubscribe();
    }
};
TransactionService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_angularfire2_database__["a" /* AngularFireDatabase */],
        __WEBPACK_IMPORTED_MODULE_5__providers_news_service_news_service__["a" /* NewsService */],
        __WEBPACK_IMPORTED_MODULE_6__providers_user_service_user_service__["a" /* UserService */]])
], TransactionService);

//# sourceMappingURL=transaction-service.js.map

/***/ }),

/***/ 202:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 202;

/***/ }),

/***/ 245:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 245;

/***/ }),

/***/ 330:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__validator_service_validator_service__ = __webpack_require__(46);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





let AuthService = class AuthService {
    constructor(newsService, userService, validatorService) {
        this.newsService = newsService;
        this.userService = userService;
        this.validatorService = validatorService;
        console.log('Hello AuthServiceProvider Provider');
    }
    signOut() {
        this.newsService.signOut();
        this.validatorService.signOut();
        this.userService.signOut().then((user) => {
            console.log('logout success');
            //this.nav.setRoot(LoginPage);
        }, function (error) {
            console.log('logout fail:', error);
        });
    }
};
AuthService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__news_service_news_service__["a" /* NewsService */],
        __WEBPACK_IMPORTED_MODULE_3__user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_4__validator_service_validator_service__["a" /* ValidatorService */]])
], AuthService);

//# sourceMappingURL=auth-service.js.map

/***/ }),

/***/ 343:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_firebase_app__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_firebase_app___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_firebase_app__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__pages_login_email_login_email__ = __webpack_require__(344);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_signup_email_signup_email__ = __webpack_require__(345);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






let LoginPage = class LoginPage {
    constructor(loadingCtrl, navCtrl, userService) {
        this.loadingCtrl = loadingCtrl;
        this.navCtrl = navCtrl;
        this.userService = userService;
    }
    loginFB() {
        this.loading = this.loadingCtrl.create({
            content: 'Logging in ...',
            dismissOnPageChange: true,
        });
        this.loading.present();
        var provider = new __WEBPACK_IMPORTED_MODULE_2_firebase_app__["auth"].FacebookAuthProvider();
        provider.addScope('public_profile');
        provider.addScope('email');
        this.userService.signInRedirect(provider);
    }
    loginGoogle() {
        this.loading = this.loadingCtrl.create({
            content: 'Logging in ...',
            dismissOnPageChange: true
        });
        var provider = new __WEBPACK_IMPORTED_MODULE_2_firebase_app__["auth"].GoogleAuthProvider();
        this.userService.signInRedirect(provider);
    }
    loginEmail() {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__pages_login_email_login_email__["a" /* LoginEmailPage */]);
    }
    goSignup() {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__pages_signup_email_signup_email__["a" /* SignupEmailPage */]);
    }
    ionViewDidLoad() {
    }
};
LoginPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-login',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/login/login.html"*/'<!--<ion-header>\n  <ion-navbar color="primary">\n    <ion-title>\n      Circles\n    </ion-title>\n  </ion-navbar>\n</ion-header>-->\n<ion-content >\n<div id="login-page" class="gradient-bg">\n\n  <div text-center id="title">\n    <!--<ion-icon name="lock" style="zoom:12.0;">\n    </ion-icon>-->\n    <img src="assets/logos/circles-logo.svg" alt="Circles">\n    Circles\n  </div>\n\n  <span class="error" *ngIf="error">{{ error }}</span>\n\n  <button (click)="loginFB()"><span icon="facebook"></span>Login With Facebook</button>\n  <button (click)="loginGoogle()"><span icon="google"></span>Login With Google</button>\n  <button (click)="loginEmail()"><span icon="mail"></span>Login With Email</button>\n\n  <a (click)="goSignup()" class="signupEmailPageLink">No account? <strong>Create one here</strong></a>\n\n</div>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/login/login.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_5__providers_user_service_user_service__["a" /* UserService */]])
], LoginPage);

//# sourceMappingURL=login.js.map

/***/ }),

/***/ 344:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginEmailPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




let LoginEmailPage = class LoginEmailPage {
    constructor(formBuilder, loadingCtrl, toastCtrl, userService) {
        this.formBuilder = formBuilder;
        this.loadingCtrl = loadingCtrl;
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.loginForm = formBuilder.group({
            email: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].compose([__WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].email])],
            password: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required]
        });
    }
    onSubmit(formData, formValid) {
        if (!formValid)
            return;
        this.loading = this.loadingCtrl.create({
            content: 'Logging In ...',
        });
        this.loading.present();
        this.userService.signInEmail(formData.email, formData.password).then(success => {
            console.log('email auth success');
            this.loading.dismiss();
        }).catch(error => {
            this.toast = this.toastCtrl.create({
                message: error.toString(),
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.loading.dismiss();
            this.toast.present();
        });
    }
    ionViewDidLoad() {
    }
};
LoginEmailPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-login-email',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/login-email/login-email.html"*/'<ion-header>\n  <ion-navbar color="primary">\n    <ion-title>Email Login</ion-title>\n  </ion-navbar>\n</ion-header>\n\n\n<ion-content padding>\n  <ion-row>\n    <ion-col col-8>\n      <div icon="unlock">\n        Log In\n      </div>\n    </ion-col>\n  </ion-row>\n  <ion-row>\n    <ion-col>\n      <form [formGroup]="loginForm" (ngSubmit)="onSubmit(loginForm.value, loginForm.valid)">\n        <ion-list>\n          <ion-list-header>\n            Enter your credentials below\n          </ion-list-header>\n\n          <span class="error" *ngIf="error">{{ error }}</span>\n\n            <ion-item>\n              <ion-label>Email</ion-label>\n              <ion-input formControlName="email" type="email"></ion-input>\n            </ion-item>\n\n            <ion-item>\n              <ion-label>Password</ion-label>\n              <ion-input formControlName="password" type="password"></ion-input>\n            </ion-item>\n\n            <ion-item-divider>\n              <button ion-button [disabled]="!loginForm.valid" type="submit">Log In</button>\n            </ion-item-divider>\n\n          </ion-list>\n      </form>\n    </ion-col>\n  </ion-row>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/login-email/login-email.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormBuilder */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_3__providers_user_service_user_service__["a" /* UserService */]])
], LoginEmailPage);

//# sourceMappingURL=login-email.js.map

/***/ }),

/***/ 345:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SignupEmailPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




let SignupEmailPage = class SignupEmailPage {
    constructor(formBuilder, loadingCtrl, toastCtrl, userService) {
        this.formBuilder = formBuilder;
        this.loadingCtrl = loadingCtrl;
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.createUserForm = formBuilder.group({
            email: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].compose([__WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].email])],
            password1: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required],
            password2: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required],
        }, { validator: this.passwordsAreEqual.bind(this) });
    }
    onSubmit(formData, formValid) {
        if (!formValid)
            return;
        this.userService.createAuthUser(formData.email, formData.password1).then((success) => { }, (error) => {
            this.toast = this.toastCtrl.create({
                message: 'Firebase error: ' + error,
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.toast.present();
        });
    }
    passwordsAreEqual(ctrl) {
        if (this.createUserForm && this.createUserForm.controls.password1.value) {
            let valid = this.createUserForm.controls.password1.value == this.createUserForm.controls.password2.value;
            return valid ? null : { 'passwordsAreEqual': true };
        }
    }
    ionViewDidLoad() {
    }
};
SignupEmailPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-signup-email',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/signup-email/signup-email.html"*/'<ion-header>\n  <ion-navbar color="primary">\n    <ion-title>Email Signup</ion-title>\n  </ion-navbar>\n</ion-header>\n\n\n<ion-content padding>\n  <ion-row>\n    <ion-col col-8 offset-2>\n      <div icon="unlock">\n        Join Now\n      </div>\n    </ion-col>\n  </ion-row>\n  <ion-row>\n    <ion-col>\n      <form [formGroup]="createUserForm" (ngSubmit)="onSubmit(createUserForm.value, createUserForm.valid)">\n        <ion-list>\n          <ion-list-header>\n            Enter your details below\n          </ion-list-header>\n\n          <span class="error" *ngIf="error">{{ error }}</span>\n\n            <ion-item>\n              <ion-label>Email</ion-label>\n              <ion-input formControlName="email" type="email"></ion-input>\n            </ion-item>\n\n            <ion-item>\n              <ion-label>Password</ion-label>\n              <ion-input formControlName="password1" type="password"></ion-input>\n            </ion-item>\n\n            <ion-item>\n              <ion-label>Password Repeat</ion-label>\n              <ion-input formControlName="password2" type="password"></ion-input>\n            </ion-item>\n\n            <ion-item-divider>\n              <button ion-button [disabled]="!createUserForm.valid" type="submit">Create my account</button>\n            </ion-item-divider>\n\n          </ion-list>\n      </form>\n    </ion-col>\n  </ion-row>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/signup-email/signup-email.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormBuilder */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_3__providers_user_service_user_service__["a" /* UserService */]])
], SignupEmailPage);

//# sourceMappingURL=signup-email.js.map

/***/ }),

/***/ 346:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SearchPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Subject__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Subject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_Subject__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_merge__ = __webpack_require__(347);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_merge___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_merge__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_observable_combineLatest__ = __webpack_require__(348);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_observable_combineLatest___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_observable_combineLatest__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_first__ = __webpack_require__(349);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_first___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_first__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_rxjs_add_observable_empty__ = __webpack_require__(350);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_rxjs_add_observable_empty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_rxjs_add_observable_empty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__providers_validator_service_validator_service__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__validator_detail_validator_detail__ = __webpack_require__(178);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__user_detail_user_detail__ = __webpack_require__(191);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};













let SearchPage = class SearchPage {
    constructor(navCtrl, formBuilder, userService, validatorService) {
        this.navCtrl = navCtrl;
        this.formBuilder = formBuilder;
        this.userService = userService;
        this.validatorService = validatorService;
        this.searchTerm = '';
        this.searchSubject$ = new __WEBPACK_IMPORTED_MODULE_4_rxjs_Subject__["Subject"]();
        this.search$ = this.searchSubject$;
    }
    setFilteredItems() {
        if (this.searchTerm == '') {
            this.searchSubject$.next([]);
            return;
        }
        let uObs = this.userService.filterUsers$(this.searchTerm);
        let vObs = this.validatorService.filterValidators$(this.searchTerm);
        __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__["Observable"].combineLatest(uObs, vObs).first().subscribe(combined => {
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
        }, error => console.log(error), () => { });
    }
    goToDetail(userOrVali) {
        if (userOrVali.requirements) {
            //validator
            this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_11__validator_detail_validator_detail__["a" /* ValidatorDetailPage */], userOrVali);
        }
        else {
            this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_12__user_detail_user_detail__["a" /* UserDetailPage */], userOrVali);
        }
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchPage');
    }
};
SearchPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-search',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/search/search.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title></ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n  <ion-row>\n    <div *ngIf="searchUsers" class="search-list-backdrop"></div>\n    <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="setFilteredItems()"></ion-searchbar>\n  </ion-row>\n  <ion-list>\n    <ion-item *ngFor="let userOrVali of searchSubject$ | async" (click)="goToDetail(userOrVali)">\n      <ion-avatar style="width:48px;height:48px" item-left>\n        <img src="{{userOrVali.profilePicURL}}">\n      </ion-avatar>\n      <h2>{{userOrVali.displayName}} <ion-badge *ngIf="userOrVali.requirements">Validator</ion-badge></h2>      \n      <p>{{userOrVali.greeting}} </p>\n    </ion-item>\n  </ion-list>\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/search/search.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormBuilder */],
        __WEBPACK_IMPORTED_MODULE_9__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_10__providers_validator_service_validator_service__["a" /* ValidatorService */]])
], SearchPage);

//# sourceMappingURL=search.js.map

/***/ }),

/***/ 351:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApplyPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_validator_service_validator_service__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_home_home__ = __webpack_require__(177);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_profile_profile__ = __webpack_require__(179);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_confirm_modal_confirm_modal__ = __webpack_require__(190);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








let ApplyPage = class ApplyPage {
    constructor(navCtrl, navParams, modalController, loadingCtrl, userService, validatorService, newsService) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.modalController = modalController;
        this.loadingCtrl = loadingCtrl;
        this.userService = userService;
        this.validatorService = validatorService;
        this.newsService = newsService;
        this.validator = {};
        this.user = {};
        this.applied = false;
        this.allRequirementsMet = true;
        this.validator = navParams.get('validator');
        this.user = navParams.get('user');
        this.requirements = navParams.get('reqs');
        for (let r of this.requirements) {
            if (!r.completed)
                this.allRequirementsMet = false;
        }
        if (this.validator.appliedUsers) {
            for (let key of this.validator.appliedUsers) {
                if (this.user.uid == key)
                    this.applied = true;
            }
        }
    }
    apply() {
        let msg = "You are about to apply for validation from  " + this.validator.displayName;
        let conf = this.modalController.create(__WEBPACK_IMPORTED_MODULE_7__pages_confirm_modal_confirm_modal__["a" /* ConfirmModal */], { title: 'Confirm Apply', message: msg });
        conf.present();
        conf.onDidDismiss((confirm) => {
            if (confirm) {
                this.loading = this.loadingCtrl.create({
                    content: 'Applying ...'
                });
                this.loading.present();
                this.validatorService.applyForValidation(this.user, this.validator);
                this.newsService.addValidatorTrustRequest(this.validator);
                if (this.validator.autoAccept) {
                    setTimeout(() => {
                        this.validatorService.completeValidation(this.user, this.validator);
                        this.newsService.addValidatorTrustAccept(this.validator);
                        this.userService.saveUser();
                        this.validatorService.saveValidator(this.validator);
                        this.loading.dismiss();
                        this.navCtrl.pop();
                    }, 2000);
                }
                else {
                    this.loading.dismiss();
                    this.navCtrl.pop();
                }
                this.userService.saveUser();
                this.validatorService.saveValidator(this.validator);
            }
            else {
                this.loading.dismiss();
            }
        });
    }
    gotoProvider(req) {
        if (req.completed)
            return;
        if (req.displayName == 'Email' || req.displayName == 'Profile Photo' || req.displayName == 'Name') {
            this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_5__pages_home_home__["a" /* HomePage */]).then((res) => {
                this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__pages_profile_profile__["a" /* ProfilePage */]);
            });
        }
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad ApplyPage');
    }
};
ApplyPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-apply',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/apply/apply.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title>Apply for Validation from {{validator.displayName}}</ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n<ion-content padding>\n  <ion-list>\n    <ion-list-header>REQUIREMENTS</ion-list-header>\n\n      <ion-item *ngFor="let req of requirements" (click)="gotoProvider(req)">\n        <h1>{{req.displayName}}</h1>\n        <p *ngIf="req.completed">Completed</p>\n        <p *ngIf="!req.completed">{{req.message}}</p>\n        <span item-right>\n          <ion-icon name="{{req.icon}}" [ngClass]="{\'req-not-met\': !req.completed, \'req-met\': req.completed}"></ion-icon>\n        </span>\n      </ion-item>\n  </ion-list>\n\n\n    <button class="group-button" ion-button [disabled]="!allRequirementsMet" (click)="apply()" >\n      <span *ngIf="!hasApplied">Apply</span>\n      <span *ngIf="hasApplied">Applied</span>\n    </button>\n\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/apply/apply.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* ModalController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_4__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_2__providers_validator_service_validator_service__["a" /* ValidatorService */],
        __WEBPACK_IMPORTED_MODULE_3__providers_news_service_news_service__["a" /* NewsService */]])
], ApplyPage);

//# sourceMappingURL=apply.js.map

/***/ }),

/***/ 380:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SendPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_notifications__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_notifications___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_notifications__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_debounceTime__ = __webpack_require__(368);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_debounceTime___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_debounceTime__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_transaction_service_transaction_service__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_confirm_modal_confirm_modal__ = __webpack_require__(190);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








let SendPage = class SendPage {
    constructor(formBuilder, loadingCtrl, notificationsService, modalController, toastCtrl, transactionService, userService, navCtrl, navParams) {
        this.formBuilder = formBuilder;
        this.loadingCtrl = loadingCtrl;
        this.notificationsService = notificationsService;
        this.modalController = modalController;
        this.toastCtrl = toastCtrl;
        this.transactionService = transactionService;
        this.userService = userService;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.toUser = navParams.data;
        this.sendForm = formBuilder.group({
            toUserKey: [this.toUser.uid, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required],
            amount: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required],
            message: [null]
        });
    }
    onSubmit(formData, formValid) {
        if (!formValid)
            return;
        if (this.user.balance < formData.amount) {
            this.notificationsService.create('Send Fail', '', 'error');
            let msg = "You don't have enough Circles!";
            this.notificationsService.create('Balance', msg, 'warn');
            return;
        }
        let toUserName = this.userService.keyToUserName(formData.toUserKey);
        let msg = "You are about to send " + formData.amount + " to " + toUserName;
        let conf = this.modalController.create(__WEBPACK_IMPORTED_MODULE_7__pages_confirm_modal_confirm_modal__["a" /* ConfirmModal */], { title: 'Confirm Send', message: msg });
        conf.present();
        conf.onDidDismiss((confirm) => {
            if (confirm) {
                this.loading = this.loadingCtrl.create({
                    content: 'Sending ...'
                });
                this.loading.present();
                if (this.transactionService.createTransactionIntent(formData.toUserKey, formData.amount, formData.message)) {
                    //reset the recipient field
                    this.toUser = null;
                    this.sendForm.reset();
                    this.userService.saveUser();
                    this.loading.dismiss();
                    this.navCtrl.pop();
                }
                else {
                    this.loading.dismiss();
                    this.navCtrl.pop();
                }
            }
        });
    }
    ionViewDidLoad() {
        this.userSub$ = this.userService.user$.subscribe(user => this.user = user, error => {
            this.toast = this.toastCtrl.create({
                message: 'Error getting user: ' + error,
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.toast.present();
        }, () => console.log('send ionViewDidLoad userSub$ obs complete'));
    }
    ionViewWillUnload() {
        this.userSub$.unsubscribe();
    }
};
SendPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-send',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/send/send.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title></ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n<ion-content padding>\n  <ion-row>\n    <ion-col col-8 offset-2>\n      Send Circles to another user\n    </ion-col>\n  </ion-row>\n\n\n  <form [formGroup]="sendForm" (ngSubmit)="onSubmit(sendForm.value, sendForm.valid)">\n    <ion-row>\n      <ion-col>\n        <ion-item>\n          <ion-label>Recipient</ion-label>\n          <ion-input hidden formControlName="toUserKey" type="text"></ion-input>\n          <div item-content>{{ toUser?.displayName }}</div>\n        </ion-item>\n        <ion-item>\n          <ion-label>Amount?</ion-label>\n          <ion-input formControlName="amount" type="number"></ion-input>\n        </ion-item>\n        <ion-item>\n          <ion-label>Message</ion-label>\n          <ion-input formControlName="message" type="text"></ion-input>\n        </ion-item>\n      </ion-col>\n    </ion-row>\n    <ion-row>\n\n    </ion-row>\n    <ion-row>\n      <ion-col>\n        <ion-item-divider>\n          <button ion-button full type="submit" [disabled]="!sendForm.valid">Send Circles</button>\n        </ion-item-divider>\n      </ion-col>\n    </ion-row>\n  </form>\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/send/send.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormBuilder */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_3_angular2_notifications__["NotificationsService"],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* ModalController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_5__providers_transaction_service_transaction_service__["a" /* TransactionService */],
        __WEBPACK_IMPORTED_MODULE_6__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */]])
], SendPage);

//# sourceMappingURL=send.js.map

/***/ }),

/***/ 381:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WalletPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




let WalletPage = class WalletPage {
    constructor(db, navCtrl, navParams, userService, toastCtrl) {
        this.db = db;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.userService = userService;
        this.toastCtrl = toastCtrl;
    }
    priorityUp(coin) {
        coin.priority--;
        let c1 = this.displayWallet[coin.priority];
        c1.priority++;
        this.displayWallet[coin.priority] = coin;
        this.displayWallet[c1.priority] = c1;
    }
    priorityDown(coin) {
        coin.priority++;
        let c1 = this.displayWallet[coin.priority];
        c1.priority--;
        this.displayWallet[coin.priority] = coin;
        this.displayWallet[c1.priority] = c1;
    }
    orderByPriority() {
        this.displayWallet.sort((a, b) => {
            if (a.priority > b.priority) {
                return 1;
            }
            if (a.priority < b.priority) {
                return -1;
            }
            return 0;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let c of this.displayWallet) {
                this.user.wallet[c.owner] = c;
            }
            this.userService.updateUser({ wallet: this.user.wallet });
            this.navCtrl.pop();
        });
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad WalletPage');
        this.userSub$ = this.userService.user$.subscribe(user => {
            this.user = user;
            this.displayWallet = [];
            for (let i in this.user.wallet) {
                let w = Object.assign({}, this.user.wallet[i]);
                w.displayOwner = this.userService.keyToUserName(w.owner);
                this.displayWallet.push(w);
            }
            this.orderByPriority();
        }, error => {
            this.toast = this.toastCtrl.create({
                message: 'Error getting user: ' + error,
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.toast.present();
        }, () => console.log('send ionViewDidLoad userSub$ obs complete'));
    }
};
WalletPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-wallet',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/wallet/wallet.html"*/'<!--\n  Generated template for the WalletPage page.\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n  Ionic pages and navigation.\n-->\n<ion-header>\n\n  <ion-navbar>\n    <ion-title>WalletPage</ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n\n  <ion-grid>\n    <ion-row style="font-weight:600;">\n      <ion-col>\n        Coin\n      </ion-col>\n      <ion-col>\n        Owner\n      </ion-col>\n      <ion-col>\n        Amount\n      </ion-col>\n      <ion-col>\n        Priority\n      </ion-col>\n    </ion-row>\n    <ion-row *ngFor="let coin of displayWallet">\n      <ion-col col-3>\n        {{coin.title}}\n      </ion-col>\n      <ion-col col-4>\n        {{coin.displayOwner}}\n      </ion-col>\n      <ion-col col-2>\n        {{coin.amount}}\n      </ion-col>\n      <ion-col col-3>\n        <button [disabled]="coin.priority < 1" class="pButton" (click)="priorityUp(coin)">\n          &uarr;\n        </button> {{coin.priority}}\n        <button [disabled]="coin.priority >= displayWallet.length-1" class="pButton" (click)="priorityDown(coin)">\n          &darr;\n        </button>\n      </ion-col>\n    </ion-row>\n  </ion-grid>\n  <button ion-button full (click)="save()">SAVE</button>\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/wallet/wallet.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_angularfire2_database__["a" /* AngularFireDatabase */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_3__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */]])
], WalletPage);

//# sourceMappingURL=wallet.js.map

/***/ }),

/***/ 382:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SettingsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
let SettingsPage = class SettingsPage {
    constructor(navCtrl, navParams, userService) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.userService = userService;
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad SettingsPage');
        //load user data
        this.userSub$ = this.userService.user$.subscribe(user => {
            this.user = user;
            console.log("user", user);
        });
    }
    saveSettings() {
    }
};
SettingsPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-settings',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/settings/settings.html"*/'<ion-header>\n  <ion-navbar color="primary">\n    <ion-title>Settings</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n\n  <ion-row>\n    <ion-col>\n\n      <form (ngSubmit)="saveSettings()">\n        <!-- First Name -->\n        <ion-item>\n          <ion-label stacked>First Name</ion-label>\n          <ion-input type="text" [value]="user?.firstName" name="firstname"></ion-input>\n        </ion-item>\n\n        <!-- Last Name -->\n        <ion-item>\n          <ion-label stacked>Last Name</ion-label>\n          <ion-input type="text" [value]="user?.lastName" name="lastname"></ion-input>\n        </ion-item>\n\n        <!-- Greeting -->\n        <ion-item>\n          <ion-label stacked>Greeting</ion-label>\n          <ion-input type="text" [value]="user?.greeting" name="title"></ion-input>\n        </ion-item>\n        <button ion-button type="submit" block>Save</button>\n      </form>\n\n    </ion-col>\n  </ion-row>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/settings/settings.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__["a" /* UserService */]])
], SettingsPage);

//# sourceMappingURL=settings.js.map

/***/ }),

/***/ 383:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WelcomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_observable_interval__ = __webpack_require__(361);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_observable_interval___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_observable_interval__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_storage_service_storage_service__ = __webpack_require__(185);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__providers_news_service_news_service__ = __webpack_require__(53);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









let WelcomePage = class WelcomePage {
    constructor(sanitizer, formBuilder, loadingCtrl, navCtrl, navParams, newsService, storageService, toastCtrl, userService) {
        this.sanitizer = sanitizer;
        this.formBuilder = formBuilder;
        this.loadingCtrl = loadingCtrl;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.newsService = newsService;
        this.storageService = storageService;
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/circles-testnet.appspot.com/o/profilepics%2FGeneric_Image_Missing-Profile.jpg?alt=media&token=f1f08984-69f3-4f25-b505-17358b437d7a";
        this.formState = {
            type: null,
            submitAttempt: false,
            profilePicRequired: false,
            profilePicSelected: false
        };
        this.profilePageViewNames = ['Intro', 'User Type', 'User Info', 'Picture', 'Disclaimer'];
        this.authUser = navParams.get('authUser');
        this.userObs$ = navParams.get('obs');
        this.userTypeForm = formBuilder.group({
            type: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required],
        });
        this.individualForm = formBuilder.group({
            firstName: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].compose([__WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].maxLength(30), __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].pattern('[a-zA-Z ]*'), __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required])],
            lastName: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].compose([__WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].maxLength(30), __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].pattern('[a-zA-Z ]*'), __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required])],
            email: [this.authUser.email, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].email]
        });
        this.organisationForm = formBuilder.group({
            organisation: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].compose([__WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].maxLength(30), __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].pattern('[a-zA-Z0-9 ]*'), __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].required])],
            tagline: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].compose([__WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].maxLength(60)])],
            website: [null],
            email: [this.authUser.email, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].email]
        });
        this.picForm = formBuilder.group({
            profilePicURL: [null, __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* Validators */].minLength(24)],
        });
        this.disclaimerForm = formBuilder.group({});
        // Missing array elems are added based on setUserTypeSlides()
        this.formGroups = [null, this.userTypeForm, null, this.picForm, this.disclaimerForm];
    }
    onFirstSlideSubmit() {
        if (this.userTypeForm.controls.type.value)
            this.setUserTypeSlides();
        this.welcomeSlider.slideNext();
    }
    onSecondSlideSubmit() {
        this.setUserTypeSlides();
        this.welcomeSlider.lockSwipeToNext(false);
        this.welcomeSlider.slideNext();
    }
    onSubmit(formData, formValid) {
        if (!formValid)
            return;
        this.welcomeSlider.lockSwipeToNext(false);
        this.welcomeSlider.slideNext();
    }
    setUserTypeSlides() {
        this.formState.type = this.userTypeForm.controls.type.value;
        //we have the user type so build the formgroup array to fit the form path
        if (this.formState.type == 'individual') {
            this.formGroups[2] = this.individualForm;
        }
        else {
            this.formGroups[2] = this.organisationForm;
        }
    }
    onSlideWillChange() {
        // this returns the slide we are going to
        let i = this.welcomeSlider.getActiveIndex();
        //this will stop users from swiping to the next slide if they have not completed the current one
        if (this.formGroups[i] && !this.formGroups[i].valid)
            this.welcomeSlider.lockSwipeToNext(true);
        else
            this.welcomeSlider.lockSwipeToNext(false);
    }
    onSlideDidChange() {
        let i = this.welcomeSlider.getActiveIndex();
        let slideName = this.profilePageViewNames[i];
        //this.analytics.trackPageView('Profile Page: ' + slideName);
    }
    fileChangeEvent(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = (e) => {
                let img = new Image;
                img.src = reader.result;
                img.onload = ((file) => {
                    this.storageService.resizePicFile(fileInput.target.files, img.height, img.width).subscribe(imageBlob => {
                        this.profilePicURL = URL.createObjectURL(imageBlob);
                        this.base64ImageData = this.profilePicURL.substring(23);
                        this.profilePicUpload = new __WEBPACK_IMPORTED_MODULE_6__providers_storage_service_storage_service__["b" /* UploadFile */](imageBlob, this.authUser.uid);
                    });
                });
            };
            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }
    saveForm() {
        this.loading = this.loadingCtrl.create({
            content: 'Saving Profile ...'
        });
        this.loading.present();
        let user = {};
        user.uid = this.authUser.uid;
        if (this.formState.type === 'individual') {
            user = user;
            user.firstName = this.individualForm.get('firstName').value;
            user.lastName = this.individualForm.get('lastName').value;
            user.displayName = user.firstName + ' ' + user.lastName;
            user.email = this.individualForm.get('email').value || '';
            user.profilePicURL = this.picForm.get('profilePicURL').value;
        }
        else {
            user = user;
            user.displayName = this.organisationForm.get('organisation').value;
            user.email = this.organisationForm.get('email').value || '';
            user.greeting = this.organisationForm.get('tagline').value || '';
            user.website = this.organisationForm.get('website').value || '';
            user.profilePicURL = this.picForm.get('profilePicURL').value;
        }
        if (this.profilePicUpload) {
            let progressIntervalObs$ = __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["Observable"].interval(200).subscribe(() => {
                this.loading.data.content = this.sanitizer.bypassSecurityTrustHtml('<p>Saving Profile ...</p><progress value="' + this.profilePicUpload.progress + '" max="100"></progress>');
            });
            this.storageService.uploadFile(this.profilePicUpload).then((profileURL) => {
                user.profilePicURL = profileURL;
                progressIntervalObs$.unsubscribe();
                user.authProviders = ['photo'];
                this.saveUser(user);
            }, (error) => {
                progressIntervalObs$.unsubscribe();
                this.toast = this.toastCtrl.create({
                    message: error.message + ': ' + error.details,
                    duration: 2500,
                    position: 'middle'
                });
                console.error(error);
                this.toast.present();
            });
        }
        else {
            //save w generic profile pic
            user.profilePicURL = this.profilePicURL;
            this.saveUser(user);
        }
    }
    saveUser(formUser) {
        //sends us back to app.component's auth observer
        let user = this.userService.createCirclesUser(formUser);
        this.userObs$.set({ userData: user }).then((result) => {
            this.loading.dismiss();
        }, (error) => {
            this.loading.dismiss();
            this.toast = this.toastCtrl.create({
                message: 'Error saving User record: ' + error,
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.toast.present();
        });
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad WelcomePage');
    }
};
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* Slides */]),
    __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* Slides */])
], WelcomePage.prototype, "welcomeSlider", void 0);
WelcomePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-welcome',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/welcome/welcome.html"*/'<ion-header>\n  <ion-navbar color="primary">\n    <ion-title>\n      Circles\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n<ion-content>\n\n  <ion-slides pager (ionSlideWillChange)="onSlideWillChange()" (ionSlideDidChange)="onSlideDidChange()">\n\n    <ion-slide>\n      <ion-row>\n        <ion-col col-8 offset-2>\n          <div class="slide-heading">\n            Before we get started, we have a few questions\n          </div>\n        </ion-col>\n      </ion-row>\n      <ion-row>\n        <ion-col col-8 offset-2>\n          <div class="slide-text">\n            Please answer honestly, this network requires the trust of each user to survive and prosper!\n          </div>\n        </ion-col>\n      </ion-row>\n      <ion-row>\n        <ion-col>\n          <div class="slide-buttons">\n            <button ion-button full (click)="onFirstSlideSubmit()"> Next</button>\n          </div>\n        </ion-col>\n      </ion-row>\n\n    </ion-slide>\n\n    <ion-slide>\n      <ion-row>\n        <ion-col col-8 offset-2>\n          <div class="slide-heading">\n            Are you an individual or organisation?\n          </div>\n        </ion-col>\n      </ion-row>\n      <ion-row>\n        <ion-col>\n          <form [formGroup]="userTypeForm">\n            <ion-list radio-group>\n              <ion-list-header>\n                What type of user are you? {{formState.type}}\n              </ion-list-header>\n\n              <ion-list radio-group formControlName="type">\n                <ion-item>\n                  <ion-label>Individual</ion-label>\n                  <ion-radio (ionSelect)="onSecondSlideSubmit()" value="individual"></ion-radio>\n                </ion-item>\n\n                <ion-item>\n                  <ion-label>Organisation</ion-label>\n                  <ion-radio (ionSelect)="onSecondSlideSubmit()" value="organisation"></ion-radio>\n                </ion-item>\n              </ion-list>\n\n            </ion-list>\n          </form>\n        </ion-col>\n      </ion-row>\n    </ion-slide>\n\n\n    <ion-slide>\n      <div *ngIf="formState.type == \'individual\'">\n        <ion-row>\n          <ion-col col-8 offset-2>\n            <div class="slide-heading">\n              Please tell us a bit about yourself\n            </div>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col>\n\n            <form [formGroup]="individualForm" (ngSubmit)="onSubmit(individualForm.value, individualForm.valid)">\n              <ion-list>\n                <ion-item>\n                  <ion-label>First Name</ion-label>\n                  <ion-input formControlName="firstName" type="text"></ion-input>\n                </ion-item>\n                <div *ngIf="formState.submitAttempt">\n                  <div *ngIf="individualForm.controls.firstName.dirty && !individualForm.controls.firstName.valid" class="alert alert-danger">\n                    Letters only please!\n                  </div>\n                  <div *ngIf="individualForm.controls.firstName.pristine || individualForm.controls.firstName.value == \'\'" class="alert alert-danger">\n                    First name is required!\n                  </div>\n                </div>\n                <ion-item>\n                  <ion-label>Last Name</ion-label>\n                  <ion-input formControlName="lastName" type="text"></ion-input>\n                </ion-item>\n                <div *ngIf="formState.submitAttempt">\n                  <div *ngIf="individualForm.controls.lastName.dirty && !individualForm.controls.lastName.valid" class="alert alert-danger">\n                    Letters only please!\n                  </div>\n                  <div *ngIf="individualForm.controls.lastName.pristine || individualForm.controls.lastName.value == \'\'" class="alert alert-danger">\n                    First name is required!\n                  </div>\n                </div>\n                <ion-item>\n                  <ion-label>Email</ion-label>\n                  <ion-input formControlName="email" type="email"></ion-input>\n                </ion-item>\n\n                <div *ngIf="individualForm.controls.email.hasErrors && individualForm.controls.email.dirty " class="alert alert-danger">\n                  Enter Valid Email Address!!!\n                </div>\n                <ion-item-divider>\n                  <button ion-button full type="submit" [disabled]="!individualForm.valid" >Next</button>\n                </ion-item-divider>\n              </ion-list>\n            </form>\n          </ion-col>\n        </ion-row>\n      </div>\n      <div *ngIf="formState.type == \'organisation\'">\n        <ion-row>\n          <ion-col col-8 offset-2>\n            <div class="slide-heading">\n              Please tell us a bit about your organisation\n            </div>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col>\n            <form [formGroup]="organisationForm" (ngSubmit)="onSubmit(organisationForm.value, organisationForm.valid)">\n\n              <ion-item>\n                <ion-label>Organisation Name</ion-label>\n                <ion-input formControlName="organisation" type="text"></ion-input>\n              </ion-item>\n\n              <ion-item>\n                <ion-label>Tagline</ion-label>\n                <ion-input formControlName="tagline" type="text"></ion-input>\n              </ion-item>\n\n              <ion-item>\n                <ion-label>Website</ion-label>\n                <ion-input formControlName="website" type="text"></ion-input>\n              </ion-item>\n\n              <ion-item>\n                <ion-label>Email</ion-label>\n                <ion-input formControlName="email" type="email"></ion-input>\n              </ion-item>\n\n              <div *ngIf="organisationForm.controls.email.hasErrors && organisationForm.controls.email.dirty " class="alert alert-danger">\n                Enter Valid Email Address!!!\n              </div>\n              <ion-item-divider>\n                <button ion-button full type="submit" [disabled]="!organisationForm.valid">Next</button>\n              </ion-item-divider>\n            </form>\n          </ion-col>\n        </ion-row>\n      </div>\n    </ion-slide>\n\n    <ion-slide>\n      <ion-row>\n        <ion-col col-8 offset-2>\n          <div class="slide-heading">\n            <div *ngIf="formState.type == \'individual\'">\n              Please submit a photo of your face\n            </div>\n            <div *ngIf="formState.type == \'organisation\'">\n              Please submit a picture of your logo\n            </div>\n          </div>\n        </ion-col>\n      </ion-row>\n      <form [formGroup]="picForm" (ngSubmit)="onSubmit(picForm.value, picForm.valid)">\n        <ion-row>\n          <ion-col col-6 offset-3>\n            <ion-input hidden formControlName="profilePicURL" type="text"></ion-input>\n            <ion-item>\n              <ion-label stacked>Profile Picture</ion-label>\n              <!-- <div class="circle-crop" [ngStyle]="{\'background-image\': \'url(\' + profilePicURL + \')\'}"> -->\n                <div item-content>\n                  <img [src]="sanitizer.bypassSecurityTrustResourceUrl(profilePicURL)">\n                </div>\n            </ion-item>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col col-8 offset-2>\n\n          <input ion-input *ngIf="storageService.isUploadSupported()" (change)="fileChangeEvent($event)" id="file" type="file" accept="image/*">\n          <button ion-button *ngIf="this.base64ImageData" (click)="fileUpload()">Upload Photo</button>\n            <ion-item-divider>\n              <button ion-button full type="submit" [disabled]="!picForm.valid">Next</button>\n            </ion-item-divider>\n          </ion-col>\n        </ion-row>\n      </form>\n\n    </ion-slide>\n\n    <ion-slide>\n      <form [formGroup]="disclaimerForm" (ngSubmit)="saveForm()">\n        <div>This is a disclaimer about the project being art.</div>\n        <button ion-button type="submit">Agree</button>\n\n      </form>\n    </ion-slide>\n\n  </ion-slides>\n\n</ion-content>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/pages/welcome/welcome.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["DomSanitizer"],
        __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormBuilder */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_8__providers_news_service_news_service__["a" /* NewsService */],
        __WEBPACK_IMPORTED_MODULE_6__providers_storage_service_storage_service__["a" /* StorageService */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_7__providers_user_service_user_service__["a" /* UserService */]])
], WelcomePage);

//# sourceMappingURL=welcome.js.map

/***/ }),

/***/ 384:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(385);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(389);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 389:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(426);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__ = __webpack_require__(285);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_splash_screen__ = __webpack_require__(290);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_platform_browser_animations__ = __webpack_require__(756);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_angularfire2_auth__ = __webpack_require__(165);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_angularfire2__ = __webpack_require__(758);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_ng2_pica__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_angular2_notifications__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_angular2_notifications___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11_angular2_notifications__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__pages_home_home__ = __webpack_require__(177);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__pages_profile_profile__ = __webpack_require__(179);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__pages_search_search__ = __webpack_require__(346);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__pages_user_detail_user_detail__ = __webpack_require__(191);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__pages_validator_detail_validator_detail__ = __webpack_require__(178);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__pages_login_login__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__pages_login_email_login_email__ = __webpack_require__(344);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__pages_signup_email_signup_email__ = __webpack_require__(345);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__pages_send_send__ = __webpack_require__(380);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__pages_apply_apply__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__pages_welcome_welcome__ = __webpack_require__(383);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__pages_confirm_modal_confirm_modal__ = __webpack_require__(190);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__pages_wallet_wallet__ = __webpack_require__(381);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__pages_settings_settings__ = __webpack_require__(382);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__components_news_card_news_card__ = __webpack_require__(759);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__providers_storage_service_storage_service__ = __webpack_require__(185);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__providers_auth_service_auth_service__ = __webpack_require__(330);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__providers_transaction_service_transaction_service__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__providers_news_service_news_service__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_32__providers_validator_service_validator_service__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_33__environments_environment__ = __webpack_require__(760);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//core







//vendor





//pages














//components

//services






//configs

let AppModule = class AppModule {
};
AppModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_21__pages_apply_apply__["a" /* ApplyPage */],
            __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* CirclesApp */],
            __WEBPACK_IMPORTED_MODULE_23__pages_confirm_modal_confirm_modal__["a" /* ConfirmModal */],
            __WEBPACK_IMPORTED_MODULE_12__pages_home_home__["a" /* HomePage */],
            __WEBPACK_IMPORTED_MODULE_18__pages_login_email_login_email__["a" /* LoginEmailPage */],
            __WEBPACK_IMPORTED_MODULE_17__pages_login_login__["a" /* LoginPage */],
            __WEBPACK_IMPORTED_MODULE_26__components_news_card_news_card__["a" /* NewsCard */],
            __WEBPACK_IMPORTED_MODULE_13__pages_profile_profile__["a" /* ProfilePage */],
            __WEBPACK_IMPORTED_MODULE_14__pages_search_search__["a" /* SearchPage */],
            __WEBPACK_IMPORTED_MODULE_20__pages_send_send__["a" /* SendPage */],
            __WEBPACK_IMPORTED_MODULE_25__pages_settings_settings__["a" /* SettingsPage */],
            __WEBPACK_IMPORTED_MODULE_19__pages_signup_email_signup_email__["a" /* SignupEmailPage */],
            __WEBPACK_IMPORTED_MODULE_15__pages_user_detail_user_detail__["a" /* UserDetailPage */],
            __WEBPACK_IMPORTED_MODULE_16__pages_validator_detail_validator_detail__["a" /* ValidatorDetailPage */],
            __WEBPACK_IMPORTED_MODULE_24__pages_wallet_wallet__["a" /* WalletPage */],
            __WEBPACK_IMPORTED_MODULE_22__pages_welcome_welcome__["a" /* WelcomePage */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_7_angularfire2_auth__["b" /* AngularFireAuthModule */],
            __WEBPACK_IMPORTED_MODULE_8_angularfire2_database__["b" /* AngularFireDatabaseModule */],
            __WEBPACK_IMPORTED_MODULE_9_angularfire2__["a" /* AngularFireModule */].initializeApp(__WEBPACK_IMPORTED_MODULE_33__environments_environment__["a" /* environment */].firebase),
            __WEBPACK_IMPORTED_MODULE_6__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["BrowserModule"],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* CirclesApp */], {
                scrollPadding: false,
                scrollAssist: true,
                autoFocusAssist: false,
                mode: 'ios'
            }),
            __WEBPACK_IMPORTED_MODULE_10_ng2_pica__["a" /* Ng2PicaModule */],
            __WEBPACK_IMPORTED_MODULE_11_angular2_notifications__["SimpleNotificationsModule"].forRoot()
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* IonicApp */]],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_21__pages_apply_apply__["a" /* ApplyPage */],
            __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* CirclesApp */],
            __WEBPACK_IMPORTED_MODULE_23__pages_confirm_modal_confirm_modal__["a" /* ConfirmModal */],
            __WEBPACK_IMPORTED_MODULE_12__pages_home_home__["a" /* HomePage */],
            __WEBPACK_IMPORTED_MODULE_18__pages_login_email_login_email__["a" /* LoginEmailPage */],
            __WEBPACK_IMPORTED_MODULE_17__pages_login_login__["a" /* LoginPage */],
            __WEBPACK_IMPORTED_MODULE_13__pages_profile_profile__["a" /* ProfilePage */],
            __WEBPACK_IMPORTED_MODULE_14__pages_search_search__["a" /* SearchPage */],
            __WEBPACK_IMPORTED_MODULE_20__pages_send_send__["a" /* SendPage */],
            __WEBPACK_IMPORTED_MODULE_25__pages_settings_settings__["a" /* SettingsPage */],
            __WEBPACK_IMPORTED_MODULE_19__pages_signup_email_signup_email__["a" /* SignupEmailPage */],
            __WEBPACK_IMPORTED_MODULE_15__pages_user_detail_user_detail__["a" /* UserDetailPage */],
            __WEBPACK_IMPORTED_MODULE_16__pages_validator_detail_validator_detail__["a" /* ValidatorDetailPage */],
            __WEBPACK_IMPORTED_MODULE_24__pages_wallet_wallet__["a" /* WalletPage */],
            __WEBPACK_IMPORTED_MODULE_22__pages_welcome_welcome__["a" /* WelcomePage */]
        ],
        providers: [
            { provide: __WEBPACK_IMPORTED_MODULE_0__angular_core__["ErrorHandler"], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicErrorHandler */] },
            __WEBPACK_IMPORTED_MODULE_28__providers_auth_service_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_31__providers_news_service_news_service__["a" /* NewsService */],
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_splash_screen__["a" /* SplashScreen */],
            __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__["a" /* StatusBar */],
            __WEBPACK_IMPORTED_MODULE_27__providers_storage_service_storage_service__["a" /* StorageService */],
            __WEBPACK_IMPORTED_MODULE_30__providers_transaction_service_transaction_service__["a" /* TransactionService */],
            __WEBPACK_IMPORTED_MODULE_29__providers_user_service_user_service__["a" /* UserService */],
            __WEBPACK_IMPORTED_MODULE_32__providers_validator_service_validator_service__["a" /* ValidatorService */]
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 426:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CirclesApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(285);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(290);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angularfire2_auth__ = __webpack_require__(165);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_auth_service_auth_service__ = __webpack_require__(330);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__pages_login_login__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__pages_home_home__ = __webpack_require__(177);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__pages_wallet_wallet__ = __webpack_require__(381);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__pages_settings_settings__ = __webpack_require__(382);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__pages_profile_profile__ = __webpack_require__(179);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__pages_welcome_welcome__ = __webpack_require__(383);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};














var authUserObs$;
let CirclesApp = class CirclesApp {
    constructor(afAuth, db, authService, loadingCtrl, platform, splashScreen, statusBar, toastCtrl, userService) {
        this.afAuth = afAuth;
        this.db = db;
        this.authService = authService;
        this.loadingCtrl = loadingCtrl;
        this.platform = platform;
        this.splashScreen = splashScreen;
        this.statusBar = statusBar;
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.rootPage = __WEBPACK_IMPORTED_MODULE_8__pages_login_login__["a" /* LoginPage */];
        platform.ready().then(() => {
            if (this.platform.is('cordova')) {
            }
            statusBar.styleDefault();
            this.userService.authState$.subscribe(auth => {
                if (auth) {
                    let authUserObs$ = this.db.object('/users/' + auth.uid);
                    let authUserSub$ = authUserObs$.subscribe(user => {
                        if (!user.$exists()) {
                            this.nav.push(__WEBPACK_IMPORTED_MODULE_13__pages_welcome_welcome__["a" /* WelcomePage */], { authUser: auth, obs: authUserObs$ });
                        }
                        else {
                            authUserSub$.unsubscribe();
                            this.userService.initUserSubject$.next(user.userData);
                            this.nav.setRoot(__WEBPACK_IMPORTED_MODULE_9__pages_home_home__["a" /* HomePage */]);
                        }
                    }, error => {
                        this.toast = this.toastCtrl.create({
                            message: 'Error saving user: ' + error,
                            duration: 2500,
                            position: 'middle'
                        });
                        console.error(error);
                        this.toast.present();
                    });
                }
                else {
                    this.nav.setRoot(__WEBPACK_IMPORTED_MODULE_8__pages_login_login__["a" /* LoginPage */]);
                }
            }, error => {
                this.toast = this.toastCtrl.create({
                    message: 'User auth error: ' + error,
                    duration: 2500,
                    position: 'middle'
                });
                console.error(error);
                this.toast.present();
            }, () => { });
        });
    }
    goToWallet() {
        this.nav.push(__WEBPACK_IMPORTED_MODULE_10__pages_wallet_wallet__["a" /* WalletPage */]);
    }
    goToSettings() {
        this.nav.push(__WEBPACK_IMPORTED_MODULE_11__pages_settings_settings__["a" /* SettingsPage */]);
    }
    goToProfile() {
        this.nav.push(__WEBPACK_IMPORTED_MODULE_12__pages_profile_profile__["a" /* ProfilePage */]);
    }
    logout() {
        this.authService.signOut();
    }
};
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])('content'),
    __metadata("design:type", Object)
], CirclesApp.prototype, "nav", void 0);
CirclesApp = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/app/app.html"*/'<ion-menu [content]="content">\n  <ion-header>\n    <ion-toolbar>\n      <ion-title>Menu</ion-title>\n    </ion-toolbar>\n  </ion-header>\n\n  <ion-content>\n    <ion-list>\n\n      <button menuClose ion-item (click)="goToProfile()">\n        <ion-icon name="person" item-left></ion-icon>\n        Profile\n      </button>\n\n      <button menuClose ion-item (click)="goToSettings()">\n        <ion-icon name="cog" item-left></ion-icon>\n        Settings\n      </button>\n\n      <button menuClose ion-item>\n        <ion-icon name="information" item-left></ion-icon>\n        About\n      </button>\n\n      <button menuClose ion-item (click)="goToWallet()">\n        <ion-icon name="cash" item-left></ion-icon>\n        Wallet\n      </button>\n\n      <button menuClose ion-item (click)="logout()">\n        <ion-icon name="log-out" item-left></ion-icon>\n        Logout\n      </button>\n\n    </ion-list>\n  </ion-content>\n\n</ion-menu>\n\n<simple-notifications [options]="{timeOut:2500}" ></simple-notifications>\n\n<!-- Disable swipe-to-go-back because it\'s poor UX to combine STGB with side menus -->\n<ion-nav [root]="rootPage" #content swipeBackEnabled="false"></ion-nav>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_4_angularfire2_auth__["a" /* AngularFireAuth */],
        __WEBPACK_IMPORTED_MODULE_5_angularfire2_database__["a" /* AngularFireDatabase */],
        __WEBPACK_IMPORTED_MODULE_6__providers_auth_service_auth_service__["a" /* AuthService */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* LoadingController */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */],
        __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */],
        __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_7__providers_user_service_user_service__["a" /* UserService */]])
], CirclesApp);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 46:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ValidatorService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_ReplaySubject__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_ReplaySubject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_ReplaySubject__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_observable_forkJoin__ = __webpack_require__(342);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_observable_forkJoin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_observable_forkJoin__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







let ValidatorService = class ValidatorService {
    constructor(db, userService) {
        this.db = db;
        this.userService = userService;
        this.initValSubject$ = new __WEBPACK_IMPORTED_MODULE_2_rxjs_ReplaySubject__["ReplaySubject"](1);
        this.allProviders = {};
        this.allValidators = {};
        this.validators$ = this.initValSubject$.asObservable();
        this.validatorsFirebaseObj$ = this.db.list('/validators/');
        this.providersFirebaseObj$ = this.db.list('/static/authProviders/');
        this.userService.initUserSubject$.take(1).subscribe(initUser => {
            const initStreams = [this.userService.initUserSubject$, this.providersFirebaseObj$, this.validatorsFirebaseObj$];
            const combinator = (user, providers, validators) => {
                this.user = user;
                this.providers = providers;
                this.userProviders = [];
                for (let provider of this.providers) {
                    this.allProviders[provider.$key] = provider;
                    let p = Object.assign({}, provider);
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
                    this.userValidators = this.user.validators.map((vKey) => this.keyToValidator(vKey));
                }
                else {
                    this.userValidators = [];
                }
            };
            this.combinedSub$ = __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__["Observable"].combineLatest(initStreams, combinator).first().subscribe((result) => console.log('initStreams'), (error) => console.log(error), () => {
                const userStreams = [this.userService.user$, this.providersFirebaseObj$, this.validatorsFirebaseObj$];
                this.combinedSub$ = __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__["Observable"].combineLatest(userStreams, combinator).subscribe((result) => console.log('userStreams'), (error) => console.log(error), () => console.log('userStreams close'));
            });
        });
    }
    initialise() {
        const initStreams = [this.userService.initUserSubject$, this.providersFirebaseObj$, this.validatorsFirebaseObj$];
        const combinator = (user, providers, validators) => {
            this.user = user;
            this.providers = providers;
            this.userProviders = [];
            for (let provider of this.providers) {
                this.allProviders[provider.$key] = provider;
                let p = Object.assign({}, provider);
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
                this.userValidators = this.user.validators.map((vKey) => this.keyToValidator(vKey));
            }
            else {
                this.userValidators = [];
            }
        };
    }
    getUserProviders(user) {
        this.userProviders = [];
        for (let pKey in this.allProviders) {
            let p = Object.assign({}, this.allProviders[pKey]);
            if (user.authProviders.find(aKey => pKey == aKey)) {
                p.completed = true;
            }
            this.userProviders.push(p);
        }
        return this.userProviders;
    }
    getValidatorRequirements(vali, user) {
        this.valRequirements = [];
        for (let req of vali.requirements) {
            let r = Object.assign({}, this.allProviders[req]);
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
    keyToValidatorName$(key) {
        return this.validatorsFirebaseObj$.map(valis => {
            let v = valis.find(vali => vali.$key === key);
            return v.displayName;
        });
    }
    keyToValidatorName(key) {
        let d = this.allValidators[key];
        //if (!d)
        //todo:error message
        return d.displayName;
    }
    keyToValidator$(key) {
        return this.validatorsFirebaseObj$.map(valis => {
            let v = valis.find(vali => vali.$key === key);
            return v;
        });
    }
    keyToValidator(key) {
        let d = this.allValidators[key];
        //if (!d)
        //todo:error message
        return d;
    }
    keyToProvider(key) {
        let d = this.allProviders[key];
        //if (!d)
        //todo:error message
        return d;
    }
    filterValidators$(searchTerm) {
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
    revokeValidation(user, validator) {
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
    applyForValidation(user, validator) {
        if (!validator.appliedUsers)
            validator.appliedUsers = [user.uid];
        else
            validator.appliedUsers.push(user.uid);
    }
    completeValidation(user, validator) {
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
    }
    saveValidator(validator) {
        this.validatorsFirebaseObj$.update(validator.$key, validator);
    }
    signOut() {
        if (this.combinedSub$)
            this.combinedSub$.unsubscribe();
    }
};
ValidatorService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_angularfire2_database__["a" /* AngularFireDatabase */], __WEBPACK_IMPORTED_MODULE_6__user_service_user_service__["a" /* UserService */]])
], ValidatorService);

//# sourceMappingURL=validator-service.js.map

/***/ }),

/***/ 53:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NewsService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular2_notifications__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular2_notifications___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular2_notifications__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angularfire2_database__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_firebase_app__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_firebase_app___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_firebase_app__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_BehaviorSubject__ = __webpack_require__(176);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_BehaviorSubject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_BehaviorSubject__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_combineLatest__ = __webpack_require__(337);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_combineLatest___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_combineLatest__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_take__ = __webpack_require__(338);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_take___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_take__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_rxjs_add_operator_isEmpty__ = __webpack_require__(339);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_rxjs_add_operator_isEmpty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_rxjs_add_operator_isEmpty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__providers_user_service_user_service__ = __webpack_require__(17);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};










let NewsService = class NewsService {
    constructor(db, notificationsService, userService) {
        this.db = db;
        this.notificationsService = notificationsService;
        this.userService = userService;
        this.newsItemsReversed$ = new __WEBPACK_IMPORTED_MODULE_4_rxjs_BehaviorSubject__["BehaviorSubject"]([]);
        this.newsItems$ = new __WEBPACK_IMPORTED_MODULE_4_rxjs_BehaviorSubject__["BehaviorSubject"]([]);
        this.userService.initUserSubject$.take(1).subscribe(initUser => {
            this.setupDBQuery(initUser.uid);
            if (!initUser.agreedToDisclaimer)
                this.addCreateUser(initUser);
            this.userService.user$.subscribe((user) => this.user = user);
        }, error => console.error(error), () => console.log('news-service constructor user$ obs complete'));
    }
    setupDBQuery(uid) {
        // sets up a db list binding that will initially return all messages from the last
        // two minutes and then any added to the list after that.
        this.newsItemsFirebaseList$ = this.db.list('/users/' + uid + '/news/');
        let twoMinsAgo = Date.now() - 120000;
        this.newsItemsFirebaseList$.$ref
            .orderByChild('timestamp')
            .startAt(twoMinsAgo)
            .on('child_added', (firebaseObj, index) => {
            let latestNewsItem = firebaseObj.val();
            //receiving from someone
            if (latestNewsItem.type == 'transaction' && latestNewsItem.to == uid) {
                let fromUser = this.userService.keyToUser(latestNewsItem.from);
                let msg = 'Receieved ' + latestNewsItem.amount + ' Circles from ' + fromUser.displayName;
                this.notificationsService.create('Transaction', msg, 'info');
            }
        });
        this.newsItemsFirebaseList$.subscribe(this.newsItems$);
        this.newsItemsSub$ = this.newsItemsFirebaseList$.subscribe(newsitems => {
            let rev = newsitems.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);
            this.newsItemsReversed$.next(rev);
        }, error => {
            console.log("Firebase Error: " + error);
        }, () => console.log('news-service setupDBQuery newsItemsSub$ obs complete'));
    }
    get allNewsItems$() {
        return this.newsItems$;
    }
    get allnewsItemsReversed$() {
        return this.newsItemsReversed$;
    }
    addTransaction(toUser, amount, message) {
        //this will only be called for sending to someone else
        let newsItem = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            from: this.user.uid,
            amount: amount,
            to: toUser.uid,
            type: 'transaction',
            message: message || ''
        };
        this.newsItemsFirebaseList$.push(newsItem);
        this.db.list('/users/' + toUser.uid + '/news/').push(newsItem);
    }
    addValidatorTrustRequest(validator) {
        let msg = 'You applied for validation from: ' + validator.displayName;
        this.notificationsService.create('Apply', msg, 'info');
        let newsItem = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            from: validator.$key,
            type: 'validatorRequest'
        };
        this.newsItemsFirebaseList$.push(newsItem);
    }
    addCreateUser(initUserData) {
        let msg = 'Welcome to Circles ' + initUserData.displayName + '!';
        this.notificationsService.create('User Created', msg, 'success');
        let n = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            type: 'createAccount'
        };
        this.newsItemsFirebaseList$.push(n);
        if (this.userService.type == 'organisation') {
            let n2 = {
                timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
                type: 'issuance',
                amount: initUserData.balance,
                coinTitle: initUserData.wallet[initUserData.uid].title
            };
            this.newsItemsFirebaseList$.push(n2);
        }
    }
    addValidatorTrustAccept(validator) {
        let msg = 'You have been validated by: ' + validator.displayName;
        this.notificationsService.create('Validation', msg, 'success');
        let newsItem = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            from: validator.$key,
            type: 'validatorAccept'
        };
        this.newsItemsFirebaseList$.push(newsItem);
    }
    addTrust(user) {
        let msg = 'You have started trusting: ' + user.displayName;
        this.notificationsService.create('Trust', msg, 'info');
        let newsItem = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            to: user.uid,
            type: 'trustUser'
        };
        this.newsItemsFirebaseList$.push(newsItem);
    }
    revokeUserTrust(user) {
        let msg = 'You have stopped trusting: ' + user.displayName;
        this.notificationsService.create('Revoke', msg, 'warn');
        let newsItem = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            to: user.uid,
            type: 'revokeUser'
        };
        this.newsItemsFirebaseList$.push(newsItem);
    }
    revokeValidatorTrust(vali) {
        let msg = 'You are no longer validated by: ' + vali.displayName;
        this.notificationsService.create('Revoke', msg, 'warn');
        let newsItem = {
            timestamp: __WEBPACK_IMPORTED_MODULE_3_firebase_app__["database"]['ServerValue']['TIMESTAMP'],
            to: vali.$key,
            type: 'revokeValidator'
        };
        this.newsItemsFirebaseList$.push(newsItem);
    }
    signOut() {
        if (this.newsItemsSub$)
            this.newsItemsSub$.unsubscribe();
    }
    ngOnDestroy() {
        this.newsItemsSub$.unsubscribe();
    }
};
NewsService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_angularfire2_database__["a" /* AngularFireDatabase */],
        __WEBPACK_IMPORTED_MODULE_1_angular2_notifications__["NotificationsService"],
        __WEBPACK_IMPORTED_MODULE_9__providers_user_service_user_service__["a" /* UserService */]])
], NewsService);

//# sourceMappingURL=news-service.js.map

/***/ }),

/***/ 759:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NewsCard; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_validator_service_validator_service__ = __webpack_require__(46);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




let NewsCard = class NewsCard {
    constructor(toastCtrl, userService, validatorService) {
        this.toastCtrl = toastCtrl;
        this.userService = userService;
        this.validatorService = validatorService;
    }
    ngOnInit() {
        this.userSub$ = this.userService.user$.subscribe(user => {
            this.user = user;
        }, error => {
            this.toast = this.toastCtrl.create({
                message: 'Error getting user: ' + error,
                duration: 2500,
                position: 'middle'
            });
            console.error(error);
            this.toast.present();
        }, () => console.log('news-card ngOnInit userSub$ obs complete'));
        if (this.newsItem.type == 'createAccount') {
            this.title = "Account Creation";
            this.itemIcon = "add-circle";
            this.message = "Your Circles account was created!";
            this.profilePicURL = this.user.profilePicURL;
        }
        else if (this.newsItem.type == 'transaction' && this.newsItem.from == this.user.uid) {
            this.title = "Sent Circles";
            this.itemIcon = "arrow-dropright-circle";
            let user = this.userService.keyToUser(this.newsItem.to);
            this.profilePicURL = user.profilePicURL;
            this.message = `${this.newsItem.amount} Circles to ${user.displayName}`;
        }
        else if (this.newsItem.type == 'transaction' && this.user.uid == this.newsItem.to) {
            this.title = "Received Circles";
            this.itemIcon = "arrow-dropleft-circle";
            let user = this.userService.keyToUser(this.newsItem.from);
            this.profilePicURL = user.profilePicURL;
            this.message = `${this.newsItem.amount} Circles from ${user.displayName}`;
        }
        else if (this.newsItem.type == 'validatorRequest') {
            this.title = "Validator Request";
            this.itemIcon = "help-circle";
            let validator = this.validatorService.keyToValidator(this.newsItem.from);
            this.profilePicURL = validator.profilePicURL;
            this.message = `Requested validation from: ${validator.displayName}`;
        }
        else if (this.newsItem.type == 'validatorAccept') {
            this.title = "Validator Accept";
            this.itemIcon = "checkmark-circle";
            let validator = this.validatorService.keyToValidator(this.newsItem.from);
            this.profilePicURL = validator.profilePicURL;
            this.message = `Validated by: ${validator.displayName}`;
        }
        else if (this.newsItem.type == 'revokeValidator') {
            this.title = "Revoke Validation";
            this.itemIcon = "close-circle";
            let validator = this.validatorService.keyToValidator(this.newsItem.to);
            this.profilePicURL = validator.profilePicURL;
            this.message = `No longer validated by ${validator.displayName}`;
        }
        else if (this.newsItem.type == 'trustUser') {
            this.title = "Trust Afforded";
            this.itemIcon = "checkmark-circle";
            let user = this.userService.keyToUser(this.newsItem.to);
            this.profilePicURL = user.profilePicURL;
            this.message = `Afforded trust to: ${user.displayName}`;
        }
        else if (this.newsItem.type == 'revokeUser') {
            this.title = "Revoke Trust";
            this.itemIcon = "close-circle";
            let user = this.userService.keyToUser(this.newsItem.to);
            this.profilePicURL = user.profilePicURL;
            this.message = `Stopped trusting: ${user.displayName}`;
        }
        else if (this.newsItem.type == 'issuance') {
            this.title = "Issuance";
            this.itemIcon = "cash";
            this.message = `Issued ${this.newsItem.amount} ${this.newsItem.coinTitle}s`;
            this.profilePicURL = this.user.profilePicURL;
        }
    }
    ngOnDestroy() {
        this.userSub$.unsubscribe();
    }
};
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])('newsItem'),
    __metadata("design:type", Object)
], NewsCard.prototype, "newsItem", void 0);
NewsCard = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'news-card',template:/*ion-inline-start:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/components/news-card/news-card.html"*/'<ion-item class="news-card">\n  <ion-avatar style="width:48px;height:48px" item-left>\n    <img src="{{profilePicURL}}">\n  </ion-avatar>\n  <ion-icon item-start name="{{itemIcon}}"></ion-icon>\n  <h2>{{title}}</h2>\n  <p>{{message}}</p>\n</ion-item>\n'/*ion-inline-end:"/Volumes/HDD/work/Client Work/TheRules/Circles/circles-prototype/src/components/news-card/news-card.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* ToastController */],
        __WEBPACK_IMPORTED_MODULE_2__providers_user_service_user_service__["a" /* UserService */],
        __WEBPACK_IMPORTED_MODULE_3__providers_validator_service_validator_service__["a" /* ValidatorService */]])
], NewsCard);

//# sourceMappingURL=news-card.js.map

/***/ }),

/***/ 760:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const environment = {
    production: true,
    firebase: {
        apiKey: 'AIzaSyD-qk6NzF4sTQwqvgTSzl6z-tUH4Wd7PXc',
        authDomain: 'circles-testnet.firebaseapp.com',
        databaseURL: 'https://circles-testnet.firebaseio.com',
        projectId: 'circles-testnet',
        storageBucket: 'circles-testnet.appspot.com',
        messagingSenderId: '551885395202'
    },
    googleAnalytics: {
        id: 'UA-80367144-2'
    },
    cloudSettings: {
        core: {
            fcm_key: 'AAAAgH7u1QI:APA91bGwrBmTvZtLJKuzfeR_dP4x_wQm0LCMKR_IQWUwZSam3aCmqSGQ14txad1RlZaXSvly0F_Hte2pAHPSZaSOC63HMPojgQlxv1gIGUT7Z052G9IBVzmQ2Q5kFFljCY2KgdugPZ8-',
            app_id: '742b9e39'
        },
        push: {
            sender_id: '551885395202',
            app_id: 'ec89dac3-9e63-4670-97f2-b49726099286',
            pluginConfig: {
                ios: {
                    badge: true,
                    sound: true
                },
                android: {
                    iconColor: '#343434'
                }
            }
        }
    }
};
/* harmony export (immutable) */ __webpack_exports__["a"] = environment;

//# sourceMappingURL=environment.js.map

/***/ })

},[384]);
//# sourceMappingURL=main.js.map