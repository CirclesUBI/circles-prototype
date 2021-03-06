This is a prototype for Circles UBI App.
Hosted on: [http://circles.cafe-grundeinkommen.org/](http://circles.cafe-grundeinkommen.org/)

## easy setup
1. if you don't already have ionic installed run `sudo npm install -g ionic cordova`
2. run `sudo npm install` to install other packages
3. You will need to get the directory `src/environments` from one of the project owners - ask Ed or Jack
3. run `ionic serve` to compile and run the app on a webserver.
4. http://localhost:8100/ should open automatically
5. Create a new account using email address - Google and Facebook logins are currently not working, I think? (jk)

## to run on ios / android:
1. to install deployment tool: `npm install -g ios-deploy`
2. run `ionic cordova build ios`
3. open the xcode project file located in platforms/ios/MyApp.xcodeproj
4. run the app in a simulator, or if you have an Apple Developers License, you can run it on a device
5. more useful info here: http://ionicframework.com/docs/v1/guide/testing.html

## Firebase DB is here:
https://console.firebase.google.com/u/0/project/circles-testnet/database/data


## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myTabs tabs
```

Then, to run it, cd into `myTabs` and run:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.

