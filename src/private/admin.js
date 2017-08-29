// override user XHR & impersonate user override
function XHR(query,callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST","/api/admin",true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer "+localStorage.getItem('admin'));
  xhr.onreadystatechange = callback;
  xhr.send(`query=${query}`);
  return xhr;
}
function expireById(id) {
  if(confirm('Are you sure you want to expire this token?')) {
    XHR(`mutation {userTokenExpire(id:"${id}"){email expires}}`, // query
      function() { // callback
        if (this.readyState == 4 && this.status == 200) {
          location.reload();
        }
      }
    );
  }
}
function deleteById(id) {
  if(confirm(`Are you sure you want to delete ${id}?`)) {
    return XHR(`mutation {userDeleteById(id:"${id}"){id email}}`, // query
      function() { // callback
        if (this.readyState == 4 && this.status == 200) {
          location.reload();
        }
      }
    );
  }
}
// impersonate user override 
function resetMyPassword() { 
  XHR(`mutation {userPasswordReset(id:"${localStorage.getItem('id')}"){password}}`,  // query
    function() { // callback
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
// impersonate user override 
function getMyToken(renew) { 
  let id = localStorage.getItem('id');
  let query = `query {User(id:"${id}"){id token expires}}`;
  if(typeof renew != 'undefined' && renew) {
    query = `mutation {userTokenNew(id:"${id}"){id token expires}}`;
  }
  XHR(query,  // query
    function() { // callback
      if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText).data;
        let User = data.User || data.userTokenNew;
        if (document.getElementById("mytoken") !== null) { 
          document.getElementById("mytoken").value = User.token;
          document.getElementById("expires").value = User.expires;
        }
        localStorage.setItem('id',User.id);
        localStorage.setItem('token',User.token);
        localStorage.setItem('expires',User.expires);
      }
    });
}
function updateStatusById(id,status) {
    XHR(`mutation {userSetStatus(id:"${id}",status:"${status}"){email status}}`,  // query
    function() { // callback
      if (this.readyState == 4 && this.status == 200) {
        let email = JSON.parse(this.responseText).data.userSetStatus.email;
        let alert = document.querySelector("#alert-message");
        alert.style = "padding:1em;";
        status = (status) ? status : 'disabled';
        alert.innerHTML = `${email} is now ${status}.`;
        location.hash = '';
        location.hash = '#invite-user';
      }
    }
  );
}
function inviteByEmail() {
  let email = document.getElementById("email").value.replace('+','%2b');
  XHR(`mutation {userInvite(email:"${email}"){url}}`,  // query
    function() { // callback
      if (this.readyState == 4 && this.status == 200) {
        let url = JSON.parse(this.responseText).data.url;
        let alert = document.querySelector("#alert-message");
        alert.style = "padding:1em;"
        alert.innerHTML = `Please provide ${email} with this link to set a password: ${url}<br><strong>Note: this link <em>expires in 24 hours</em>. It has NOT been automatically sent to the user (automated emailing hasn't been added).</strong>`;
        location.hash = '';
        location.hash = '#invite-user';
      }
    }
  );
}
function recoverById(id) {
  if(confirm('Are you sure recover this user?')) {
    XHR(`mutation {userRecoverById(id:"${id}") {id email}}`,  // query
    function() { // callback
      if (this.readyState == 4 && this.status == 200) {
        location.reload();
      }
    });
  }
}