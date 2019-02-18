// Init F7 Vue Plugin
Framework7.use(Framework7Vue);

// Init Page Components
Vue.component('page-about', {
    template: '#page-about'
});
Vue.component('page-form', {
    template: '#page-form'
});
Vue.component('page-dynamic-routing', {
    template: '#page-dynamic-routing'
});
Vue.component('page-not-found', {
    template: '#page-not-found'
});
Vue.component('page-others', {
    template: '#page-others'
});
Vue.component('page-status', {
    template: '#page-status'
});

// Init App
new Vue({
    el: '#app',
    data: function () {
        return {
            // Framework7 parameters here
            f7params: {
                root: '#app', // App root element
                id: 'io.f7.gc', // App bundle ID
                name: 'GreenCarrier', // App name
                theme: 'auto', // Automatic theme detection
                // App routes
                routes: [
                    {
                        path: '/about/',
                        component: 'page-about'
                    },
                    {
                        path: '/others/',
                        component: 'page-others'
                    },
                    {
                        path: '/status/',
                        component: 'page-status'
                    },
                    // {
                    //     path: '/lend/',
                    //     component: 'page-lend'
                    // },
                    // {
                    //     path: '/report/',
                    //     component: 'page-report'
                    // },
                    {
                        path: '/form/',
                        component: 'page-form'
                    },
                    {
                        path: '/dynamic-route/blog/:blogId/post/:postId/',
                        component: 'page-dynamic-routing'
                    },
                    {
                        path: '(.*)',
                        component: 'page-not-found',
                    },
                ],
            }
        }
    },
});