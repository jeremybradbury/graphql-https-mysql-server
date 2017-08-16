function resetPassword() {
  window.fetch('/token/password', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    let password = document.getElementById('password');
    let warning = document.getElementById('warning');
    warning.removeAttribute("style");
    password.value = json.data.password;
    password.focus();
    password.select();
  })
  .catch(function(ex) {
    console.error(ex);
  });
}

function getToken(renew) {
  let url = (typeof renew == 'undefined') ? '/user/getToken' : '/user/token';
  window.fetch(url, {
    method: 'POST',
    credentials: 'include'
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    let token = document.getElementById('token');
    let expires = document.getElementById('expires');
    token.value = json.data.token;
    expires.value = json.data.expires.slice(0, 19).replace('T', ' ');
    localStorage.setItem('token',json.data.token);
    localStorage.setItem('expires',json.data.expires);
  })
  .then(function(){
    document.getElementById('mytoken').value = localStorage.getItem('token');
    document.getElementById('expires').value = localStorage.getItem('expires').slice(0, 19).replace('T', ' ');
  })
  .catch(function(ex) {
    console.error(ex);
  });
}