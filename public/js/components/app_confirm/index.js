'use strict';
module.exports = {
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
          token: this.token.trim()
        }
        this.$http.post(this.confirmTokenURL, {
          data: data
        }).
          then(function (res) {
            console.log('server res', res.data);
            return this.$dispatch('confirmed');
          }.bind(this)).
          catch(function (info) {
            return console.log('yawa gas', info);
          });
        return this.token = ''
      }
      else {
        return console.log('oops!');
      }
    }
  }
};
