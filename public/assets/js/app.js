'use strict';
/**
 * Module Dependencies
 */
//=============================================================================
const
  Vue = require('vue'),
  VueRouter = require('vue-router'),
  jQ = require('jquery');
//=============================================================================
/**
 * Module Config
 */
//=============================================================================
Vue.use(require('vue-resource'));
Vue.http.options.root = '/root';
Vue.use(VueRouter);
//=============================================================================
/**
 * VM Components
 */
//=============================================================================
const
  Home = require('./components/app_home')(jQ),
  Sign_Up = require('./components/app_signup')(jQ),
  How = require('./components/app_how-it-works'),
  Confirm = require('./components/app_confirm')(jQ);
//=============================================================================
/**
 * Create baseVM
 */
//=============================================================================
const app = Vue.extend({
  template: require('./template.html'),
  data: () => {
    return {};
  },
  computed: {},
  components: {
    'app-nav': require('./components/app_nav'),
    'app-home': Home,
    'app-how': How,
    'app-sign': Sign_Up,
    'app_confirm': Confirm
  },
  methods: {},
  events: {
    'show-confirm': function (jwt) {
      window.localStorage.setItem('txtP_jwt', jwt);
      return this.$route.router.go({name: 'confirm'});
    },
    'show-signup': function () {
      return this.$route.router.go({name: 'sign-up'});
    },
    'confirmed': function () {
      return this.$route.router.go({name: 'home'});
    }
  },
  ready: function () {
    this.$route.router.go({name: 'home'});
  }
});
//=============================================================================
/**
 * Create router instance
 */
//=============================================================================
let router = new VueRouter();
//=============================================================================
/**
 * Define Routes
 */
//=============================================================================
router.map({
  '/home': {
    name: 'home',
    component: Home
  },
  '/sign-up': {
    name: 'sign-up',
    component: Sign_Up
  },
  '/how': {
    name: 'how',
    component: How
  },
  '/confirm': {
    name: 'confirm',
    component: Confirm
  }
});
//=============================================================================
/**
 * Start router
 */
//=============================================================================
router.start(app, '#app-main');
//=============================================================================
