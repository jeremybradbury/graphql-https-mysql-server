function resetPassword() {
  window.fetch('/token/password', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + location.pathname.split('/new/',2)[1]
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