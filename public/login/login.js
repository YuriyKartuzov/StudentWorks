var userCheck = true; 
var passCheck = true;

function validateForm() {

   if(validUser(userCheck) && validPass(passCheck)){
       return true;
   }else{
       return false;
   }
}


function validUser(str) {
	var name = document.login.username1.value.trim();

	if(name == "") {
		document.querySelector("#errorMsg").innerHTML = '* Username is required';
		userCheck = false;
	}else{
		document.querySelector("#errorMsg").innerHTML = "";
        userCheck = true;
	}
	return userCheck;
}



function validPass(str) {
	var pass = document.login.pass.value.trim();

	if(pass == "") {
		document.querySelector("#errorMsg2").innerHTML = '* Password is required';
		passCheck = false;

	}else{
		document.querySelector("#errorMsg2").innerHTML = "";
        passCheck = true;
	}
	return passCheck;
}
