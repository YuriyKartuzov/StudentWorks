var fNameCheck = true;
var lNameCheck = true;
var emailCheck = true; //for email

function validateForm() {
  var valid = true;

  if (!validfName(fNameCheck))
    valid = false;

  if (!validlName(lNameCheck))
    valid = false;

  if (!validEmail(emailCheck))
    valid = false;

  return valid;
}

function validfName() {
  var pattern = /^[a-zA-Z\s-]+$/;
  var name = document.profile.fname.value.trim();

  if (!name.match(pattern)) {
    document.querySelector("#errorMsg1").innerHTML = '  * Cannot contain special characters';
    fNameCheck = false;
  } else {
    document.querySelector("#errorMsg1").innerHTML = "";
    fNameCheck = true;
  }
  return fNameCheck;
}

function validlName() {

  var pattern = /^[a-zA-Z\s-]+$/;
  var name = document.profile.lname.value.trim();

  if (!name.match(pattern)) {
    document.querySelector("#errorMsg2").innerHTML = '  * Cannot contain special characters';
    lNameCheck = false;
  } else {
    document.querySelector("#errorMsg2").innerHTML = "";
    lNameCheck = true;
  }
  return lNameCheck;
}

function validEmail() {
  var pattern = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  var email = document.profile.email.value.trim();

  if (!email.match(pattern)) {
    document.querySelector("#errorMsg3").innerHTML = '  * Enter a valid email address';
    emailCheck = false;
  } else {
    document.querySelector("#errorMsg3").innerHTML = "";
    emailCheck = true;
  }
  return emailCheck;
}

/**************************************************** */

$(document).ready(() => {
  if ($("#userType").text() === "Visitor") {
    renderUserMenu(); // so they can log in
    return;
  }

  let id = $("#userID").text();

  let host = window.location.hostname;
  let port = window.location.port;
  let prjUrl = `https://${host}:${port}/api/getProjectsByUser/UserID/` + id;
  let usrUrl = `https://${host}:${port}/api/getUserByID/id/` + id;

  $.getJSON(prjUrl, (jsData) => { renderProjectList(jsData); });
  $.getJSON(usrUrl, (jsData) => { renderUserDetails(jsData); });

  // FORM SUBMISSION event listener
  document.getElementById("profile").addEventListener("submit", function (event) {
    event.preventDefault();

    // Create form
    var image = document.getElementById("img-input").files[0];
    var date = new Date().getTime();
    var imExt = (image) ? image.type.split('/')[1] : null;

    var FD = new FormData();
    FD.append("userID", $("#userID").text());
    FD.append("fname", $("#fname").val());
    FD.append("lname", $("#lname").val());
    FD.append("email", $("#email").val());
    FD.append("program", $("#program").val());
    FD.append("username", $("#username").val());
    FD.append("description", $("#description").val());

    if (image)
      FD.append("img-input", image, date + "." + imExt);
    else
      FD.append("img-input", null);


    $.ajax({
      url: '/profile',
      data: FD,
      type: 'POST',
      contentType: false,
      processData: false,
      success: (data, textStatus, jXHR) => {
        //alert("Holy shit it worked");
        window.location.replace("/profile");
      }, error: (err) => {
        alert("Sorry, we cannot process your request at this time.");
      }
    });
  });
});

function renderUserDetails(jsData) {
  let host = window.location.hostname;
  let port = window.location.port;
  let fName = (jsData[0].firstName && jsData[0].firstName != "NULL") ? jsData[0].firstName : "";
  let lName = (jsData[0].lastName && jsData[0].lastName != "NULL") ? jsData[0].lastName : "";
  let email = jsData[0].email ? jsData[0].email : "";
  let program = (jsData[0].program && jsData[0].program != "NULL") ? jsData[0].program : "";
  let username = jsData[0].userName ? jsData[0].userName : "Username";
  let description = (jsData[0].userDescription && jsData[0].description != "NULL") ? jsData[0].userDescription : "";
  let imageHost = `https://${host}:${port}/`;
  let imagePath = jsData[0].imagePath ? (imageHost + jsData[0].imagePath) : imageHost + "images/user.png";

  $("#fname").attr({ "value": fName });
  $("#lname").attr({ "value": lName });
  $("#email").attr({ "value": email });
  $("#program").attr({ "value": program });
  $("#username").attr({ "value": username });
  $("#description").attr({ "value": description });
  $("#imgPreview").attr({ "src": imagePath });
}

function renderProjectList(jsData) {
  let projectList = "";
  let projectStatusList = "";
  let projectYearList = "";

  $.each(jsData, (key, value) => {
    projectList += "<li>" + value.title + "</li>";
    projectStatusList += "<li>" + value.status + "</li>";
    projectYearList += "<li>" + value.creationDate.substring(0, 4) + "</li>";
  });

  renderUserMenu(); // function declared in usermenue.js
  $("#pageTitleID").html("Profile");
  $("#projectName").html(projectList);
  $("#projectStatus").html(projectStatusList);
  $("#projectYear").html(projectYearList);
}


// Preview image
$(function () {
  $('#img-preview').click(function () {
    $('#img-input').trigger('click');
  });

  $("#img-input").change(function () {
    readImage(this);
  });

  var readImage = function (input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var html = '<img src="' + e.target.result + '">'
        $('#img-preview').empty();
        $('#img-preview').html(html);
      }

      reader.readAsDataURL(input.files[0]);
    }
  };
});

