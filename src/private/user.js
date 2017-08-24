function resetMyPassword() {
  XHR(`mutation {passwordReset(data:{token:"${localStorage.getItem('token')}"}){password}}`,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText).data;
        let password = document.getElementById('password');
        let warning = document.getElementById('warning');
        warning.removeAttribute("style");
        password.value = data.password;
        password.focus();
        password.select();
      } 
    });
}

function getMyToken(renew) {
  let query = `query {tokenCheck{id token expires status}}`;
  if(typeof renew != 'undefined' && renew) {
    query = `mutation {tokenNew{id token expires status}}`;
  }
  XHR(query,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText).data;
        let User = data.tokenCheck || data.tokenNew;
        if (document.getElementById("mytoken") !== null) { 
          document.getElementById("mytoken").value = User.token;
          document.getElementById("expires").value = User.expires;
        }
        if (User.status == 'manage-users') localStorage.setItem('admin',User.token);
        localStorage.setItem('id',User.id);
        localStorage.setItem('token',User.token);
        localStorage.setItem('expires',User.expires);
      }
    });
}

function expireMe() {
  XHR(`mutation {tokenExpire{id}}`,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        location.reload();
      }
    });
}

function XHR(query,callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST","/api",true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem('token'));
  xhr.onreadystatechange = callback;
  xhr.send(`query=${query}`);
  return xhr;
}