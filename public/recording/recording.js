 $(document).ready(()=>{
   
    // Setting the title
    $("#pageTitleID").html("Video Recording");

    // Setting body
    $("#mainBody").html("<br><br><br>");

    // Setting footer
    let html = "";
    html += "<p>Samples from mockups</p>"
    html += "<a href='/images/recording.png'>website</a><br>";
    html += "<a href='/images/recording2.png'>android</a><br>";

    $('#footerHTMLid').html(html);

    renderUserMenu(); // function declaration is in /header/username.js
});

// Happy coding man :)