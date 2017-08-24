function resetMyPassword() {
  let xhr = new XMLHttpRequest();
  xhr.open("POST","/api",true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer "+location.pathname.split('/new/',2)[1]);
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText).data;
      let password = document.getElementById('password');
      let warning = document.getElementById('warning');
      warning.removeAttribute("style");
      password.value = data.password;
      password.focus();
      password.select();
    } 
  };
  xhr.send(`query=mutation {passwordReset(data:{token:"${localStorage.getItem('token')}"}){password}}`);
}