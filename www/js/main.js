// Init F7 Vue Plugin
Framework7.use(Framework7Vue);


function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}
//Cordova加載完成會觸發
function onDeviceReady() {
    let str1 = '';
    if (navigator.network.connection.type == Connection.NONE) {
        str1 = 'Disconnection.';
    } else {
        str1 = navigator.network.connection.type;
    }
    ipAddress1 = null;
    ipAddress2 = null;
    networkinterface.getCarrierIPAddress(
        function (ip, subnet) {
            ipAddress1 = ip;
        }
    );
    networkinterface.getWiFiIPAddress(
        function (ip, subnet) {
            ipAddress2 = ip;
        }
    );
    alert('isConnect:', str1, 'ip1:', ipAddress1, 'ip2:', ipAddress2);
}

// Init Page Components
Vue.component('page-not-found', {
    template: '#page-not-found'
});
Vue.component('page-search', {
    template: '#page-search'
});
Vue.component('page-admin', {
    template: '#page-admin',
    data: function () {
        return {
            cups: {
                lists: [],
                lastUpdateTime: ''
            },
            record: {
                lists: [],
                lastUpdateTime: ''
            }
        }
    },
    created() {
        const self = this;
        const app = self.$f7;

        db.collection('cups')
            // .where('borrow_datetime_for_order', '>', new Date(1995, 11, 17))
            .orderBy('create_datetime', 'desc')
            .get().then(docs => {
            docs.forEach(doc => {
                self.cups.lists.push({
                    id: doc.id,
                    name: doc.data().name,
                    status: doc.data().avaliable
                });
            });
        }).then(() => {
            let today = new Date();
            let time = today.getHours() + ':' + today.getMinutes();
            self.cups.lastUpdateTime = time;
        }).catch(err => {
            app.dialog.alert('Something got error.');
            console.log(err);
        });

        db.collection('record')
            // .where('borrow_datetime_for_order', '>', new Date(1995, 11, 17))
            .orderBy('borrow_datetime_for_order', 'desc')
            .get().then(docs => {
            docs.forEach(doc => {
                self.record.lists.push({
                    id: doc.id,
                    name: doc.data().which,
                    status: doc.data().return
                });
            });
        }).then(() => {
            let today = new Date();
            let time = today.getHours() + ':' + today.getMinutes();
            self.record.lastUpdateTime = time;
        }).catch(err => {
            app.dialog.alert('Something got error.');
            console.log(err);
        });
    },
    methods: {
        cupsStatusRefresh() {
            const self = this;
            const app = self.$f7;

            db.collection('cups')
                // .where('borrow_datetime_for_order', '>', new Date(1995, 11, 17))
                .orderBy('create_datetime', 'desc')
                .get().then(docs => {
                self.cups.lists = [];
                docs.forEach(doc => {
                    self.cups.lists.push({
                        id: doc.id,
                        name: doc.data().name,
                        status: doc.data().avaliable
                    });
                });
            }).then(() => {
                console.log('Cups refreshed.');
                let today = new Date();
                let time = today.getHours() + ':' + today.getMinutes();
                self.cups.lastUpdateTime = time;
                app.ptr.done('#tab-cups');
            }).catch(err => {
                app.dialog.alert('Something got error.');
                console.log(err);
            });
        },
        recordStatusRefresh() {
            const self = this;
            const app = self.$f7;

            db.collection('record')
                // .where('borrow_datetime_for_order', '>', new Date(1995, 11, 17))
                .orderBy('borrow_datetime_for_order', 'desc')
                .get().then(docs => {
                self.record.lists = [];
                docs.forEach(doc => {
                    self.record.lists.push({
                        id: doc.id,
                        name: doc.data().which,
                        status: doc.data().return
                    });
                });
            }).then(() => {
                console.log('Record refreshed.');
                let today = new Date();
                let time = today.getHours() + ':' + today.getMinutes();
                self.record.lastUpdateTime = time;
                app.ptr.done('#tab-record');
            }).catch(err => {
                app.dialog.alert('Something got error.');
                console.log(err);
            });
        },
        returnCup(id, name, index) {
            const self = this;
            const app = self.$f7;

            app.dialog.confirm('Sure the cup was returned?',
                () => {
                    db.collection('cups').where('name', '==', name).get().then(docs => {
                        docs.forEach(doc => {
                            db.collection('cups').doc(doc.id).update({
                                avaliable: true
                            });
                        });
                    }).then(() => {
                        db.collection('record').doc(id).update({
                            return: true,
                            return_datetime: new Date()
                        });
                    }).then(() => {
                        self.record.lists[index].status = !self.record.lists[index].status;
                    }).catch(err => {
                        app.dialog.alert('Something got error.');
                        console.log(err);
                    });
                }
            );
        },
        newcup() {
            const self = this;
            const app = self.$f7;

            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.format === 'QR_CODE') {
                        db.collection('cups')
                            .where('name', '==', result.text)
                            .get().then(docs => {
                            if (!docs.empty) {
                                app.dialog.alert('Error! This cup has existed.');
                            }
                            else {
                                db.collection('cups').add({
                                    name: result.text,
                                    avaliable: true,
                                    create_datetime: new Date()
                                }).then(() => {
                                    app.dialog.alert('New cup success.', self.cupsStatusRefresh());
                                });
                            }
                        }).catch(err => {
                            app.dialog.alert('Something got error.');
                            console.log(err);
                        });
                    }
                    else {
                        app.dialog.alert('Error! Please scan again.');
                    }
                },
                function (error) {
                    app.dialog.alert('Scanning error.');
                },
                {
                    'preferFrontCamera': false, // iOS and Android
                    'showFlipCameraButton': true, // iOS and Android
                    'showTorchButton': true, // iOS and Android
                    'disableAnimations': true, // iOS
                    'prompt': 'Please show the QR Code in the scanning area.',
                    'disableSuccessBeep': false // iOS and Android
                }
            );
        }
    }
});
Vue.component('page-status', {
    template: '#page-status',
    data: function () {
        return {
            lists: [],
            lastUpdateTime: ''
        }
    },
    created() {
        const self = this;
        const app = self.$f7;

        db.collection('record')
            .where('who', '==', auth.currentUser.uid)
            .where('borrow_datetime_for_order', '>', new Date(1995, 11, 17))
            .orderBy('borrow_datetime_for_order', 'desc')
            .get().then(docs => {
            docs.forEach(doc => {
                self.lists.push({
                    time: doc.data().borrow_datetime,
                    status: doc.data().return
                });
            });
        }).then(() => {
            let today = new Date();
            let time = today.getHours() + ':' + today.getMinutes();
            self.lastUpdateTime = time;
        }).catch(err => {
            app.dialog.alert('Something got error.');
            console.log(err);
        });
    },
    methods: {
        statusRefresh(event, done) {
            const self = this;
            const app = self.$f7;

            db.collection('record')
                .where('who', '==', auth.currentUser.uid)
                .where('borrow_datetime_for_order', '>', new Date(1995, 11, 17))
                .orderBy('borrow_datetime_for_order', 'desc')
                .get().then(docs => {
                self.lists = [];
                docs.forEach(doc => {
                    self.lists.push({
                        time: doc.data().borrow_datetime,
                        status: doc.data().return
                    });
                });
            }).then(() => {
                console.log('Status refreshed.');
                let today = new Date();
                let time = today.getHours() + ':' + today.getMinutes();
                self.lastUpdateTime = time;
                done();
            }).catch(err => {
                app.dialog.alert('Something got error.');
                console.log(err);
            });
        }
    }
});

// Init App
var vm = new Vue({
    el: '#app',
    data: function () {
        return {
            // Framework7 parameters here
            f7params: {
                root: '#app', // App root element
                id: 'io.honginho.GreenCarrier', // App bundle ID
                name: 'GreenCarrier', // App name
                theme: 'auto', // Automatic theme detection
                // App routes
                routes: [
                    {
                        path: '/admin/',
                        component: 'page-admin'
                    },
                    {
                        path: '/search/',
                        component: 'page-search'
                    },
                    {
                        path: '/status/',
                        component: 'page-status'
                    },
                    {
                        path: '(.*)',
                        component: 'page-not-found',
                    }
                ],
            },
            switchForm: true,
            signupForm: {
                username: '',
                phone: '',
                email: '',
                password: '',
                passwordCheck: ''
            },
            loginForm: {
                email: '',
                password: ''
            },
            profile: {
                uid: '',
                email: '',
                name: '',
                phone: '',
                point: ''
            },
            isAppReady: false,
            isAdmin: false,
            isEmailVerified: false,
            isLoggedIn: '',
            isOpeningReady: false,
            openingAnimation: [true, false, false, false, false, false, false, false],
            countOpeningStep: 0
        }
    },
    created: function () {
        document.addEventListener('deviceready', onDeviceReady, false);
        // console.log('created', this.isLoggedIn);
        function onDeviceReady() {
            // this.init = true;
            // alert('onDeviceReady', this.isLoggedIn);
        }
    },
    mounted: function () {
        document.addEventListener('backbutton', onBackKeyDown, false);
        // alert('mounted', this.isLoggedIn);
        function onBackKeyDown (e) {
            const self = this;
            const app = self.$f7;
            navigator.notification.confirm(
                'Are you sure you want to quit?',
                function (buttonIndex) {
                    if (buttonIndex === 1) {
                        navigator.app.exitApp();
                    }
                },
                'Exit'
            );

            // app.dialog.confirm('Sure to leave?',
            //     () => {},
            //     () => {
            //         e.preventDefault();
            //         console.log('Leaved.');
            //     }
            // );
        }
        // this.$f7.panel.open(true)

    },
    beforeUpdate: function () {
        // alert('beforeUpdate', this.isOpeningReady);

        if (this.countOpeningStep === 0) {
            this.isOpeningReady = true;
            setTimeout(() => {
                this.openingAnimation.splice(0, 1, false);
                this.countOpeningStep++;
            }, 2000);
        }

        if (this.isLoggedIn == true) {
            setTimeout(() => {
                this.isAppReady = true;
                this.countOpeningStep++;
            }, 3000);
            db.collection('users').doc(this.profile.uid).get().then(doc => {
                this.profile.email = doc.data().email;
                this.profile.name = doc.data().username;
                this.profile.phone = doc.data().phone;
                this.profile.point = doc.data().point + '';
            });
        }
        else {
            if (this.countOpeningStep === 1) {
                let step = this.openingAnimation.length;
                for (let i = 1; i < step; i++) {
                    setTimeout(() => {
                        this.openingAnimation.splice(i /* array index */, 1, true);
                    }, i * 1000);
                }
                setTimeout(() => {
                    this.isOpeningReady = false;
                    this.isAppReady = true;
                }, (step+1) * 1000);
                this.countOpeningStep++;
            }
        }
    },
    updated: function () {
        // console.log('updated', this.isLoggedIn);
    },
    beforeDestroy: function () {
        const self = this;
        const app = self.$f7;

        app.dialog.confirm('Sure to leave?');
    },
    methods: {
        skipOpening() {
            this.isOpeningReady = false;
            this.isAppReady = true;
        },
        switchla() {
            this.switchForm = !this.switchForm;
        },
        report() {
            console.log('Report page.', this.isLoggedIn);
        },
        logout() {
            const self = this;
            const app = self.$f7;

            app.dialog.confirm('Sure to log out?',
                () => {
                    app.panel.right.close();
                    setTimeout(() => {
                        auth.signOut().then(() => {
                            console.log('Logged out.');
                            self.switchForm = true;
                            self.isAdmin = false;
                            self.profile.uid = '';
                            self.profile.email = '';
                            self.profile.name = '';
                            self.profile.phone = '';
                            self.profile.point = '';
                        });
                    }, 500);
                }
            );
        },
        lending() {
            console.log('Scanning QR Code.');

            const self = this;
            const app = self.$f7;

            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.format === 'QR_CODE') {
                        db.collection('cups')
                            .where('name', '==', result.text)
                            .get().then(docs => {
                            if (docs.empty) {
                                app.dialog.alert('Error! Please scan again.');
                            }
                            else {
                                docs.forEach(doc => {
                                    // lending step 1: check if this cup is avaliable
                                    if (doc.data().avaliable) {
                                        let today = new Date();
                                        let date = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
                                        let time = today.getHours() + ':' + today.getMinutes();
                                        let dateTime = date + ' ' + time;

                                        // lending step 2: insert record
                                        db.collection('record').add({
                                            who: auth.currentUser.uid,
                                            which: result.text,
                                            return: false,
                                            borrow_datetime: dateTime,
                                            borrow_datetime_for_order: today,
                                            return_datetime: ''
                                        }).then(() => {
                                            app.dialog.alert('Borrow success.',
                                                () => {
                                                    // lending step 3: update status of this cup
                                                    db.collection('cups').doc(doc.id).update({
                                                        'avaliable': false
                                                    });
                                                }
                                            );
                                        });
                                    }
                                    else {
                                        app.dialog.alert('This cup is not avaliable.');
                                    }
                                });
                            }
                        }).catch(err => {
                            app.dialog.alert('Something got error.');
                            console.log(err);
                        });
                    }
                    else {
                        app.dialog.alert('Error! Please scan again.');
                    }
                },
                function (error) {
                    app.dialog.alert('Scanning error.');
                },
                {
                    'preferFrontCamera': false, // iOS and Android
                    'showFlipCameraButton': true, // iOS and Android
                    'showTorchButton': true, // iOS and Android
                    'disableAnimations': true, // iOS
                    'prompt': 'Please show the QR Code in the scanning area.'
                }
            );
        },
        login() {
            const self = this;
            const app = self.$f7;
            const router = self.$f7router;

            if (self.loginForm.email != '' && self.loginForm.password != '') {
                auth.signInWithEmailAndPassword(self.loginForm.email, self.loginForm.password).then(cred => {
                    self.loginForm.email = '';
                    self.loginForm.password = '';
                }).catch(err => {
                    app.dialog.alert(err.message);
                });
            }
            else {
                app.dialog.alert('Every column is required.');
            }
        },
        signup() {
            const self = this;
            const app = self.$f7;

            if (self.signupForm.username === '' || self.signupForm.phone === '') {
                app.dialog.alert('Every column is required.');
            }
            else if (self.signupForm.password !== self.signupForm.passwordCheck) {
                app.dialog.alert('Confirm Password did not match.',
                    () => {
                        self.signupForm.passwordCheck = '';
                    }
                );
            }
            else {
                auth.createUserWithEmailAndPassword(self.signupForm.email, self.signupForm.password).then(cred => {
                    this.sendVerification();

                    return db.collection('users').doc(cred.user.uid).set({
                        username: self.signupForm.username,
                        phone: self.signupForm.phone,
                        email: self.signupForm.email,
                        point: 0
                    });
                }).then(() => {
                    self.signupForm.username = '';
                    self.signupForm.phone = '';
                    self.signupForm.email = '';
                    self.signupForm.password = '';
                    self.signupForm.passwordCheck = '';
                }).catch(err => {
                    app.dialog.alert(err.message);
                });;
            }
        },
        sendVerification() {
            const self = this;
            const app = self.$f7;
            auth.currentUser.sendEmailVerification().then(() => {
                app.dialog.alert('Email verification sent.');
            }).catch(err => {
                app.dialog.alert('Something got error.');
                console.log(err);
            });
        }
    }
});

// Listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        vm.isLoggedIn = true;
        vm.profile.uid = user.uid;
        vm.isEmailVerified = auth.currentUser.emailVerified;
        console.log('User logged in:', user.email);
        console.log('User Email Verified:', auth.currentUser.emailVerified);
        if (user.email === 'sm870831@gmail.com') vm.isAdmin = true;
        else vm.isAdmin = false;
    }
    else {
        vm.isLoggedIn = false;
        console.log('User logged out.');
    }
});