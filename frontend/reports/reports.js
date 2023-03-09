var get_all_reports_endpoint = "http://localhost:8080/reports";

window.onload = httpGetAsync(get_all_reports_endpoint, updateReports);

function httpGetAsync(URL, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText);
        }
        else if(xmlHttp.status == 400){
            count = -1;
        }
    }
    xmlHttp.open("GET", URL, true); // true for asynchronous 
    xmlHttp.send(null);
}

function updateReports(responseBody){
    const json = JSON.parse(responseBody);
    var inject_html = ""
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            var html = `<div class="report_button unselectable" onclick="openReport([REPORTID])">
                            <img class="report_thumbnail" src="../assets/[REPORT_TYPE].png"/>
                            <p class="report_button_title">[REPORT_NAME]</p>
                        </div>`

            table_type = "report-table-c";
            if(json[key].ReportType > 1)
                table_type = "report-chart-c";
            chart_type = "report-chart-c";
            html = html.replaceAll('[REPORT_NAME]', json[key].ReportName);
            html = html.replace('[REPORTID]', json[key].ReportID);
            html = html.replace('[REPORT_TYPE]', table_type);
            inject_html += html;
            document.getElementById("loading_container").className = "invisible";
        }
    }
    document.getElementById("reports_buttons_container").innerHTML += inject_html;
}

function openReport(reportID){
    open("../reports/reportViewer.html?reportID="+reportID, "_self");
}