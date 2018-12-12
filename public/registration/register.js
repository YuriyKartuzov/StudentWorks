var userCheck = true; 
var passCheck = true; 
var emailCheck = true;

function validateForm() {
	if(validUser(userCheck) && validPass(passCheck) && validEmail(emailCheck)){
       return true;
   }else{
       return false;
   }
}

function validUser() {
    var pattern =  /^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/;
	var name = document.register.name.value.trim();

	if(name == "") {
		document.querySelector("#errorMsg1").innerHTML = '* Username field is required';
		userCheck = false;

	} else if (name.length > 12) {
		document.querySelector("#errorMsg1").innerHTML = '* Username cannot exceed 12 characters';
		userCheck = false;

	}else if(!name.match(pattern)){
		document.querySelector("#errorMsg1").innerHTML = '* Username cannot contain special characters';
        userCheck = false;

	}else{
		document.querySelector("#errorMsg1").innerHTML = "";
        userCheck = true;
	}
	return userCheck;
}

function validPass() {
	var pass = document.register.password1.value.trim();
	var pattern = /^(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{8,}$/;
	var patternNum = /^(?=.*[0-9]+.*)/;
	//console.log(pass);
	if(pass == "") {
		document.querySelector("#errorMsg2").innerHTML = '* Password is required';
		passCheck = false;

	} else if (pass.length < 8) {
		document.querySelector("#errorMsg2").innerHTML = '* Password must be at least 8 characters long';
		passCheck = false;

	}else if(!pass.match(pattern)){
		document.querySelector("#errorMsg2").innerHTML = '* Password must contain at least 1 letter';
			passCheck = false;

	}else if(!pass.match(patternNum)){
		document.querySelector("#errorMsg2").innerHTML = '* Password must contain at least 1 number';
			passCheck = false;

	}else{
		document.querySelector("#errorMsg2").innerHTML = "";
			passCheck = true;
	}
	return passCheck;
}

function validEmail() {
    var pattern =  /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
	var email = document.register.email.value.trim();

	if(email == "") {
		document.querySelector("#errorMsg3").innerHTML = '* Email is field is required';
		emailCheck = false;

	}else if(!email.match(pattern)){
		document.querySelector("#errorMsg3").innerHTML = '* Enter a valid email address';
        emailCheck = false;

	}else{
		document.querySelector("#errorMsg3").innerHTML = "";
        emailCheck = true;
	}
	return emailCheck;
}
