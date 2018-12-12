var userCheck = true; 


function validateForm() {
   console.log(userCheck);
   if(validUser(userCheck)){
	return true;
   }else{
       return false;
   }
}


function validUser(str) {
	var name = document.forgot.username1.value.trim();
	if(name == "" || name == null) {
		document.querySelector("#errorMsg2").innerHTML = '* Username is required';
		userCheck = false;
	}else{
		document.querySelector("#errorMsg2").innerHTML = "";
        userCheck = true;
	}
	return userCheck;
}
