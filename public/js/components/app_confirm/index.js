'use strict';
module.exports = function (jQ) {
  return {
    template: require('./template.html'),
    data: function () {
      return {
        token: '',
        confirmTokenURL: '/confirm',
        showErrMsg: false
      };
    },
    methods: {
      confirmToken: function () {
        if(this.token.trim()) {
          var data = {
            token: this.token.trim(),
            jwt: window.localStorage.getItem('txtP_jwt')
          }
          this.$http.post(this.confirmTokenURL, {
            data: data
          }).
            then(function (res) {
              return jQ('#openConfirmSuccessModal').trigger('click');
            }.bind(this)).
            catch(function (info) {
              this.showErrMsg = true;
              jQ('#confirm-err').fadeIn(300).fadeOut(5000);
              return this.showErrMsg = false;
            }.bind(this));
          return this.token = ''
        }
        else {
          return null;
        }
      },
      allDone: function () {
        jQ('#closeConfirmSuccessModal').trigger('click');
        return this.$dispatch('confirmed');
      }
    }
  };
};
