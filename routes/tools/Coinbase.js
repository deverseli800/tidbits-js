exports.Coinbase = function(request, credentials) {
  this.getAuthUrl = function(redirect) {
    return "https://coinbase.com/oauth/authorize?response_type=code&scope=request&client_id=" + credentials.clientId +
        "&redirect_uri=" + encodeURIComponent(redirect); 
  };

  this.handleCallback = function(code, callback) {
    console.log("--> " + code);
    request.post({ url : "https://coinbase.com/oauth/token?grant_type=authorization_code&code=" + encodeURIComponent(code) +
        "&client_id=" + encodeURIComponent(credentials.clientId) +
        "&client_secret=" + encodeURIComponent(credentials.clientSecret) +
        "&redirect_uri=" + encodeURIComponent("http://localhost:3000/oauth/coinbase/callback") },
        function(error, response, body) {
          console.log(JSON.stringify(error));
          console.log(JSON.stringify(body));
          callback(null, body.access_token, body.refresh_token);
        });
  };

  this.requestMoney = function(accessToken, email, amount, callback) {
    request.post({ url : 'https://coinbase.com/api/v1/transactions/request_money?access_token=' + accessToken,
        json : { from : email, amount : amount, notes : "Miezaru" } },
        function(error, response, body) {
          if (body.success) {
            callback(null, true);
          } else {
            callback({ error : body }, null);
          }
        });
  };
};