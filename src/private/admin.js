// XHR(query,callback,admin=false) declared in user.js & is required
function expireById(id) {
  XHR(`mutation {userTokenExpire(data:{id:"${id}"}){email expires}}`,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let User = JSON.parse(this.responseText).data.userTokenExpire;
        let alert = document.querySelector("#alert-message");
        alert.style = "padding:1em;"
        alert.innerHTML = `${User.email}'s API token is now expired.`;
      }
    },
    true // admin only
  );
}
function updateStatusById(id,status) {
    XHR(`mutation {userSetStatus(data:{id:"${id}",status:"${status}"}){email status}}`,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let email = JSON.parse(this.responseText).data.userSetStatus.email;
        let alert = document.querySelector("#alert-message");
        alert.style = "padding:1em;"; 
        alert.innerHTML = `${email} has been changed to ${status}.`;
      }
    },
    true // admin only
  );
}
function inviteByEmail() {
  let email = document.getElementById("email").value;
  XHR(`mutation {userInvite(data:{email:"${email}"}){url}}`,
    function() {
      if (this.readyState == 4 && this.status == 200) {
        let url = JSON.parse(this.responseText).data.url;
        let alert = document.querySelector("#alert-message");
        alert.style = "padding:1em;"
        alert.innerHTML = `Please provide ${email} with this link to set a password: ${url}<br><strong>Note: this link <em>expires in 24 hours</em>. It has NOT been automatically sent to the user (automated emailing hasn't been added).</strong>`;
      }
    },
    true // admin only
  );
}