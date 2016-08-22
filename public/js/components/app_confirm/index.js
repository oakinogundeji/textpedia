'use strict';
module.exports = function (jQ) {
  return {
    template: require('./template.html'),
    data: function () {
      return {
        token: '',
        confirmTokenURL: '/confirm'
      };
    },
    methods: {
      confirmToken: function () {
        if(this.token.trim()) {
          console.log('token:', this.token);
          var data = {
            token: this.token.trim(),
            jwt: window.localStorage.getItem('txtP_jwt')
          }
          this.$http.post(this.confirmTokenURL, {
            data: data
          }).
            then(function (res) {
              console.log('server res', res.data);
              return jQ('#openConfirmSuccessModal').trigger('click');
            }.bind(this)).
            catch(function (info) {
              return console.log('yawa gas', info);
            });
          return this.token = ''
        }
        else {
          return console.log('oops!');
        }
      },
      allDone: function () {
        console.log('user fully registered');
        jQ('#closeConfirmSuccessModal').trigger('click');
        return this.$dispatch('confirmed');
      }
    }
  };
};
