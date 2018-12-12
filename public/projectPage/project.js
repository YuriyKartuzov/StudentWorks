let host = window.location.hostname;
let port = window.location.port;

$(document).ready(() => {
    let id = getQueryStr('id');

    let url = `https://${host}:${port}/api/getOneProject/id/` + id;

    $.getJSON(url, (jsData) => {
        let year = jsData[0].creationDate ? jsData[0].creationDate.substring(0, 4) : "";
        let videoLink = `https://${host}:${port}/` + jsData[0].projectID + "/" + jsData[0].VideoFilePath;
        let ext = jsData[0].VideoFilePath.substr(jsData[0].VideoFilePath.lastIndexOf('.') + 1);

        let contributors = "<br><h4><u>Developers:</u></h4>";

        if (jsData[0].developers != null) {
            var names = jsData[0].developers.split(',');
            $.each(names, (key, value) => {
                contributors += " <p>" + value + "</p>";
            });
        }

        let languageShow = (jsData[0].language) ? "<p><b>Language: </b>" + jsData[0].language + "</p>" : "";
        let frameworkShow = (jsData[0].framework) ? "<p><b>Framework: </b> " + jsData[0].framework + "</p>" : "";
        let category = (jsData[0].category) ? "<p><b>Category: </b> " + jsData[0].category + "</p>" : "";
        let desc = (jsData[0].description) ? "<p>" + jsData[0].description + "</p>" : "";

        let git = "";
        if (jsData[0].git) {
            git = `<p><b>Git: </b> <a href="${jsData[0].git}">repository</a></p>`;
        }

        // Title
        let title = jsData[0].title + " (" + year + ")";
        let prjHtml = `
        <div class="row">
            <div id="prjVideo" class="divInl">
                <video id='videoID'  controls > <source src='${videoLink}' type='video/${ext}'></video>
            </div>
            <div id="prjMetadata" class="divInl">
                <div id="infoCol">${contributors}
                    <br><br>
                    <h4 class='prjTitle'><u>Project info:</u></h4>
                    ${languageShow} ${frameworkShow} ${category} ${git}
                </div>
            </div>
        </div>
        <div class="row">
            <div id="desc">
                <br><br><h3>Description</h3> ${desc}
            </div>
        </div>`;

        renderUserMenu(); // function declaration is in /header/username.js
        $("#pageTitleID").html(title);
        $("#projectBody").html(prjHtml);
        $("#tileNav").empty();

    })
});

function getQueryStr(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}