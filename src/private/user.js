function resetMyPassword() {
  XHR("/password-reset/",
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let User = JSON.parse(this.responseText).data;
        let password = document.getElementById('password');
        let warning = document.getElementById('warning');
        warning.removeAttribute("style");
        password.value = User.password;
        password.focus();
        password.select();
      } 
    });
}

function getMyToken(renew) {
  let url = "/token/";
  if(typeof renew != 'undefined' && renew) {
    url += "renew/";
  }
  XHR(url,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let User = JSON.parse(this.responseText).data;
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
  XHR("/token/expire/",
    function() {
      if (this.readyState == 4 && this.status == 200) {
        location.reload();
      }
    });
}

function XHR(url,callback,method) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET",url,true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem('token'));
  xhr.onreadystatechange = callback;
  xhr.send();
  return xhr;
}