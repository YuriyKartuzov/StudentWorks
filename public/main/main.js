// Seneca StudentWorks 2018
// Author: Yuriy Kartuzov

// Globals used JSON API requests and tracking pages (safe)
var httpRequest;
var start;
var pageNum;
var lastPage;
var allProjects;
let host =  window.location.hostname;
let port =  window.location.port;

// Entry point
$(document).ready(() => {

    
    let prjUrl = `https://${host}:${port}/api/getAllProjects`;

    $.getJSON(prjUrl, (data) => {
        allProjects = data;
        displayALLProjets();
    });

});

function displayALLProjets() {
    let data = allProjects; //grabbing all projects from global JSON
    lastPage = false;
    pageNum = 1;

    // Initialization
    $("#mainBody").empty();
    $("#tileNav").empty();
    $("#lngList").empty();
    $("#frmList").empty();
    $("#yearList").empty();
    $("#byLanguageLi").attr({ "class": "dropdown" });
    $("#byFrameworkLi").attr({ "class": "dropdown" });
    $("#byYearLi").attr({ "class": "dropdown" });

    // HEADER
    renderHeader(data);

    // TILE, navigation (has to be rendered before tiles, but appears after tiles ) TODO refactor
    renderTileNavigation();

    // BODY, 6 Tiles
    start = 0; // sets page count to 0, global
    renderSixProjectTiles(data);

    //NEXT Button
    $("#prevBtn").click(() => {
        $("#mainBody").empty();
        start -= 12;
        if (start < 0)
            start = 0;

        renderSixProjectTiles(data);
    });

    // PREV Button
    $("#nextBtn").click(() => {
        if (!lastPage) {
            $("#mainBody").empty();
            renderSixProjectTiles(data);
        }
    });
}

function renderHeader(data) {
    let languageList = "";
    let frameworkList = "";
    let yearList = "";

    let languageArr = [];
    let frameworkArr = [];
    let yearArr = [];

    filterOpt = "";

    filterOpt += "<li class='dropdown' id='byLanguageLi'>";
    filterOpt += "  <a href='#' class='dropdown-toggle' data-toggle='dropdown'>by Language<b class='caret'></b></a>";
    filterOpt += "  <ul class='dropdown-menu' id='lngList' role='menu'></ul>";
    filterOpt += "</li>";

    filterOpt += "<li class='dropdown' id='byFrameworkLi'>";
    filterOpt += "  <a href='#' class='dropdown-toggle' data-toggle='dropdown'>by Framework<b class='caret'></b></a>";
    filterOpt += "  <ul class='dropdown-menu frmList' id='frmList' role='menu'></ul>";
    filterOpt += "</li>";

    filterOpt += "<li class='dropdown' id='byYearLi'>";
    filterOpt += "  <a href='#' class='dropdown-toggle' data-toggle='dropdown'>by Year<b class='caret'></b></a>";
    filterOpt += "  <ul class='dropdown-menu yearList' id='yearList' role='menu'></ul>";
    filterOpt += "</li>";
    //filterOpt += "<a href='#'><span class='glyphicon glyphicon-search srchIcon'></span></a>";

    $("#optHeader").html(filterOpt);

    // Building HTLM for Filtering lists: Framework, Language, Year
    $.each(data, (key, value) => {
        if (value.language) {
            if (!languageArr.includes(value.language))
                languageArr.push(value.language);
        }

        if (value.framework) {
            if (!frameworkArr.includes(value.framework))
                frameworkArr.push(value.framework);
        }

        if (value.creationDate) {
            var year = value.creationDate.substring(0, 4);
            if (!yearArr.includes(year)) {
                yearArr.push(year);
            }
        }
    });

    languageArr.sort();
    $.each(languageArr, (k, v)=>{
        languageList += "<li> <a href='#' onclick='filterProjectsBy(\"language\" ,\"" + v + "\")'>";
        languageList += v + "</a></li>";
    });

    frameworkArr.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    $.each(frameworkArr, (k, v)=>{
        frameworkList += "<li> <a href='#' onclick='filterProjectsBy(\"framework\" ,\"" + v + "\")'>";
        frameworkList += v + "</a></li>";
    });

    yearArr.sort();
    yearArr.reverse();
    $.each(yearArr, (k, v)=>{
        yearList += "<li> <a href='#' onclick='filterProjectsBy(\"year\" ,\"" + v + "\")'>";
        yearList += v + "</a></li>";
    });
    
    $("#lngList").append(languageList);
    $("#frmList").append(frameworkList);
    $("#yearList").append(yearList);

    renderUserMenu(); // function declaration is in /header/username.js
}

function renderSixProjectTiles(jsData) {

    // Main loop for six projects
    for (var projects = 0; projects < 6; projects++) {

        if (start <= (jsData.length - 1)) { // if curent project

            var title = jsData[start].title;
            var year = jsData[start].creationDate ? jsData[start].creationDate.substring(0, 4) : "";
            var image = `https://${host}:${port}/` + jsData[start].projectID + "/" + jsData[start].ImageFilePath; // IMAGE
	        var language = jsData[start].language;
            var framework = jsData[start].framework;
            var id = jsData[start].projectID;

            var prjHtml = renderTile(title, year, image, language, framework, id);
            $("#mainBody").append(prjHtml);

            start++;
            lastPage = false;
        }
        else { // Render Empty tile
            var prjHtml = renderEmptyTile();
            $("#mainBody").append(prjHtml);

            lastPage = true;
            start++;
        }
    }

    let numOfProjects = jsData.length;
    let currPage = start / 6;
    let totalPage = Math.floor(numOfProjects / 6) + 1;
    $("#pageId").html("<span>" + currPage + " &nbsp; &#47; &nbsp; " + totalPage + "</span>");

}

function renderTile(title, year, icon, language, framework, id) {
    let imageShow = '<img src="' + icon + '" class="img-responsive center-block swPrjImage" alt="icon" >';
    let titleShow = title + " (<strong>" + year + "</strong>) ";
    let languageShow = (language) ? "<b>Language: </b>" + language : "";
    let frameworkShow = (framework) ? ", <b>Framework: </b> " + framework : "&nbsp;";
    let footer = languageShow + frameworkShow;

    let tileHtml = "";
    tileHtml += "<div class='col-md-4'>";
    tileHtml += "<div class='panel panel-default swTile'>";
    tileHtml += "   <div class='panel-heading' style='text-align: center;'><h4>" + titleShow + "</h4></div>";
    tileHtml += "       <a href='/projectPage?id=" + id + "' class ='tileLink'>";
    tileHtml += "          <div class='panel-body' style='height:200px; '>" + imageShow + "</div>";
    tileHtml += "       </a>";
    tileHtml += "   <div class='panel-footer' style='text-align: right;'> " + footer + "</div>";
    tileHtml += "</div>";

    return tileHtml;
}

function renderEmptyTile() {
    let image = '<img src="images/empty.png" class="img-responsive center-block swPrjImage" alt="icon" >';
    let footer = "<div style='text-align: center;'><a href='#' >Contribute</a></div>";

    let emptyTileHtml = "";
    emptyTileHtml += "<div class='col-md-4'>";
    emptyTileHtml += "<div class='panel panel-default swTile swEmptyTile'>";
    emptyTileHtml += "   <div class='panel-heading' style='text-align: center;'><h4>Future Proejct</h4></div>";
    emptyTileHtml += "       <a href='../contribute' class ='tileLinkEmpty'>";
    emptyTileHtml += "          <div class='panel-body' style='height:200px; '>" + image + "</div>";
    emptyTileHtml += "       </a>";
    emptyTileHtml += "   <div class='panel-footer' style='text-align: right;'> " + footer + "</div>";
    emptyTileHtml += "</div>";

    return emptyTileHtml;
}

function renderTileNavigation() {
    let tileNav = "";
    tileNav += '' +
        '<div class="row center">' +
        '  <div style="display: inline;">' +
        '    <button type="button" class="btn btn-default" id="prevBtn" aria-label="Left Align">'+ // PREVIOUS Button
        '      <span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>'+
        '    </button>'+
        '  </div>'+
        '  <div id="pageId"  style="display: inline; class="center"></div>'+
        '  <div style="display: inline;">' +
        '    <button type="button" class="btn btn-default" id="nextBtn" aria-label="Right Align">'+ // NEXT Button
        '      <span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>' +
        '    </button>'+
        '  </div>'+
        '</div>';

    $("#tileNav").append(tileNav);
}

// Render Filtering
function filterProjectsBy(sKey, sValue) {
    let jsData = allProjects; // 'allProjects' is a global JSON obj

    $("#mainBody").empty();
    $("#tileNav").empty();

    let newData = [];

    if (sKey == "language") {
        $("#byLanguageLi").attr({ "class": "dropdown active" });
        $("#byFrameworkLi").attr({ "class": "dropdown" });
        $("#byYearLi").attr({ "class": "dropdown" });
        $.each(jsData, (key, value) => {
            if (value.language == sValue) newData.push(value);
        });
    }
    else if (sKey == "framework") {
        $("#byLanguageLi").attr({ "class": "dropdown" });
        $("#byFrameworkLi").attr({ "class": "dropdown active" });
        $("#byYearLi").attr({ "class": "dropdown" });
        $.each(jsData, (key, value) => {
            if (value.framework == sValue) newData.push(value);
        });
    }
    else if (sKey == "year") {
        $("#byLanguageLi").attr({ "class": "dropdown" });
        $("#byFrameworkLi").attr({ "class": "dropdown" });
        $("#byYearLi").attr({ "class": "dropdown active" });
        $.each(jsData, (key, value) => {

            if (value.creationDate) {
                var year = value.creationDate.substring(0, 4);
                if (year == sValue) newData.push(value);
            }
        });
    }

    start = 0;
    renderTileNavigation();
    renderSixProjectTiles(newData);

    $("#prevBtn").click(() => {
        $("#mainBody").empty();
        start -= 12;
        if (start < 0)
            start = 0;

        renderSixProjectTiles(newData);
    });

    $("#nextBtn").click(() => {
        if (!lastPage) {
            $("#mainBody").empty();
            renderSixProjectTiles(newData);
        }
    });
}
