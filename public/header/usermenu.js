function renderUserMenu(){
    // There are 3 types of user: visitor, regular and admin
    let userType = $("#userType").text();
    let userMenu = ""; 

    if(userType === "Visitor"){
        userMenu += "<ul>";
        userMenu += "  <li><a href='/login'>Login</a></li>";
        userMenu += "  <li><a href='/register'>Register</a></li>";
        userMenu += "  <li><a href='/login/forgotpass'>Forgot password</a></li>";
        userMenu += "</ul>";
    }else if (userType === "Contributor") {
        userMenu += "<ul>";
        userMenu += "  <li><a href='/profile'>Profile</a></li>";
        userMenu += "  <li><a href='/contribute'>Contribute</a></li>";
        userMenu += "  <li><a href='/logout'>Logout</a></li>";
        userMenu += "</ul>";
    } else if (userType === "Admin"){
        userMenu += "<ul>";
        userMenu += "  <li><a href='/profile'>Profile</a></li>";
        userMenu += "  <li><a href='/contribute'>Contribute</a></li>";
        userMenu += "  <li><a href='/adminPage'>Administration</a></li>";
        userMenu += "  <li><a href='/logout'>Logout</a></li>";
        userMenu += "</ul>";
    }

    $("#userMenu").html(userMenu);

}
