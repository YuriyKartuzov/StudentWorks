let gl_language = "";
let gl_framework = "";
let gl_platform = "";
let gl_category = "";
let colorCh = "#f5f5f5";

$(document).ready(() => {

    renderUserMenu(); // function declaration is in /header/username.js
    renderColorPick();

    // Set the page title
    $("#pageTitleID").html("Project Upload");

    // PROJECT TITLE change
    $("#titleInput").on("keyup", () => {
        let val = $("#titleInput").val();
        $(".panel-heading").html("<h4>" + val + "</h4>");
    });

    // LANGUAGE change
    $("#lngList").change(() => {
        let val = $("#lngList option:selected").val();
        gl_language = (val != "default") ? val : "";
        $("#lngInput").val("");
        renderFooter();
    });

    $("#lngInput").change(() => {
        gl_language = $("#lngInput").val();
        $("#lngList").val("default");
        renderFooter();

    });

    // FRAMEWORK change
    $("#frmList").change(() => {
        let val = $("#frmList option:selected").val();
        gl_framework = (val == "default") ? "" : val;
        $("#frmInput").val("");
        renderFooter();
    });

    $("#frmInput").change(() => {
        gl_framework = $("#frmInput").val();
        $("#frmList").val("default");
        renderFooter();
    });

    // PLATFORM change
    $("#pltList").change(() => {
        let val = $("#pltList option:selected").val();
        gl_platform = (val != "default") ? val : "";
        $("#pltInput").val("");
        renderFooter();
    });

    $("#pltInput").change(() => {
        gl_platform = $("#pltInput").val();
        $("#pltList").val("default");
        renderFooter();
    });

    // CATEGORY change
    $("#ctgList").change(() => {
        let val = $("#ctgList option:selected").val();
        gl_category = (val != "default") ? val : "";
        $("#ctgInput").val("");
    });

    $("#ctgInput").change(() => {
        gl_category = $("#ctgInput").val();
        $("#ctgList").val("default");
    });

    // DISPLAY image
    $("#photo").change(function () {
        displayImage(this);
    });

    // DISPLAY video
    $("#video").change(function () {
        displayVideo(this);
    });

    // Form submission listener
    document.getElementById("wForm").addEventListener("submit", function (event) {
        event.preventDefault();
        submitProject();  
    });
});

function submitProject() {
    
    //Validation    
    if (gl_language == "") {
        $("#lngList").focus();
        //return;
    } else if (gl_framework == "") {
        $("#frmList").focus();
        //return;
    } else if (gl_platform == "") {
        $("#pltList").focus();
        //return;
    }

    // Image processing
    var date = new Date().getTime();
    var image = document.getElementById("photo").files[0];
    var imExt = image.type.split('/')[1];
    var photoName = date + "." + imExt;
  
    // Video processing
    var video = document.getElementById("video").files[0];
    var vidExt = video.type.split('/')[1];
    var videoName = date + "." + vidExt;

    // Creating a processed form
    var formData = new FormData();
    formData.append("userID", $("#userID").text());
    formData.append("title", $("#titleInput").val());
    formData.append("language", gl_language);
    formData.append("framework", gl_framework);
    formData.append("platform", gl_platform);
    formData.append("category", gl_category);
    formData.append("color", colorCh);
    formData.append("desc", $("#desc").val());
    formData.append("developers", $("#devs").val());
    formData.append("photo", photoName);
    formData.append("video", videoName);
    formData.append("media", image, photoName);
    formData.append("media", video, videoName);

    // Disable submit button - guard against double submit
    $("#sbmBtn").prop("disabled","true");
    $("#sbmBtn").text("Upload in progress  ");
    $("#sbmBtn").append("<i class='fa fa-refresh fa-spin' id='loadWheel'></i>");
    $("#sbmBtn").css("background-color", "#f5f5f5");
    $("#sbmBtn").css("color", "#467ab9");
    $("#loadWheel").show("swing");

     // Sending a form
    $.ajax({
        url: '/upload-project',
        data: formData,
        type: 'POST',
        contentType: false,
        processData: false,
        success : (data, textStatus, jXHR)=>{
            alert(data);
            window.location.replace("/profile");
        }
    });

}

// Tile preview - footer
function renderFooter() {
    let footerHtml = "";

    if (gl_language != "") {
        footerHtml += "<b>Language: </b>" + gl_language;
    }

    if (gl_framework != "") {
        footerHtml += (footerHtml != "") ? ", " : "";
        footerHtml += "<b>Framework: </b>" + gl_framework;
    }
    if (gl_platform != "") {
        footerHtml += (footerHtml != "") ? ", " : "";
        footerHtml += "<b>Platform: </b>" + gl_platform;
    }

    $(".panel-footer").html(footerHtml);
}

// Display image preview before uploaded
function displayImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#img').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

// Display video preview before uploaded
function displayVideo(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#videoPrv').removeAttr('hidden');
            $('#videoPrv').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}


function renderColorPick() {
    var colRow = $("#colRow");
    var colorArray = ["#f5f5f5", "#eda3a3", "#efeba0", "#a0efa1", "#a0d9ef", "#cca9d8"];
    var colHtml = "";

    $.each(colorArray, (key, color) => {
        colHtml +=
            "<td class='colTile'>" +
            "  <button type='button' class='btn colBtn' onclick='changeColor(\"" + color +"\")'" +
            "    style='background-color:"+color+"; border:solid 0.5px #dcdcdc;'></button>"+
            "</td>";
    });
   colRow.html(colHtml);
   return;
}

function changeColor(col) {
    var styleH = $(".panel-heading").attr("style");
    var styleF = $(".panel-footer").attr("style");

    $(".panel-heading").attr('style', styleH + "background-color:" + col + ";");
    $(".panel-footer").attr('style', styleF + "background-color:" + col + ";");
    $(".swTile").attr('style', "border: solid 1px " + col + ";" );

    colorCh = col; // assigning to global var
    return;
}

