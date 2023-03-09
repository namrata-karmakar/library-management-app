const get_report_params_endpoint = "http://localhost:8080/reportParams?id="
const generate_report_endpoint = "http://localhost:8080/generateReport?id="
var params = [];
const row_number_column_name = "RowNumber"
const chart_key = "$CHART"; 
const table_key = "$TABLE";

function getParams( name, url_string ) {
    var url = new URL(url_string);
    var param = url.searchParams.get(name);
    return(param);
}
window.onload = startUp();

function startUp(){
    var reportID = getParams("reportID", window.location.href);
    if (reportID == null){
        open("../reports/reports.html", "_self");
    }
    httpGetAsync(get_report_params_endpoint+reportID, addParams)
}

function httpGetAsync(URL, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText);
        }
        else if(xmlHttp.status == 400){
            //reload page
            //window.location.reload();
            console.log("error!");
        }
    }
    xmlHttp.open("GET", URL, true); // true for asynchronous 
    xmlHttp.send(null);
}

function addParams(responseBody){
    const json = JSON.parse(responseBody);
    var reportName = json[0].Report[0].ReportName;
    document.getElementById("report_title").innerHTML = reportName;
    var paramJSON = json[0].Param;
    var inject_html = "";
    var number_input = `<input type="number" class="input" id="[PARAM]" placeholder="[PARAM_HINT]" [DEFAULTVALUE]>`;
    var text_input = `<input type="text" class="input" id="[PARAM]" placeholder="[PARAM_HINT]" [DEFAULTVALUE]>`;
    var boolean_input = `<select class="input" id="[PARAM]"><option value="0" selected="selected">[PARAM_HINT]</option><option value="1">Yes</option><option value="0">No</option></select>`;
    var isDefaultSet = false;

    for (var key in paramJSON) {
        if (paramJSON.hasOwnProperty(key)) {
            var type_html = number_input;
            if (paramJSON[key].ParamType == 1)
                type_html = text_input;
            else if (paramJSON[key].ParamType == 3)
                type_html = boolean_input;
            params.push(paramJSON[key].ParamName);
            html = type_html.replace('[PARAM]', paramJSON[key].ParamName);
            html = html.replace('[PARAM_HINT]', paramJSON[key].ParamHint.replaceAll("\"", "\'"));
            if (paramJSON[key].ParamDefault){
                html = html.replace('[DEFAULTVALUE]', "value=\""+paramJSON[key].ParamDefault+"\"");
                isDefaultSet = true;
            }
            else{
                html = html.replace('[DEFAULTVALUE]', "");
            }
        }
        inject_html += html;
    }
    if(inject_html == ""){
        console.log("no params!");
        callUpdateReport();
    }
    else{
        inject_html += '<br><Button class="refresh_button" onclick="callUpdateReport()">Refresh</Button>'
        //console.log(inject_html);
        document.getElementById("inputs_container").innerHTML = inject_html;
        if(isDefaultSet){
            callUpdateReport();
        }
    }
}

function callUpdateReport(){
    document.getElementById("loading_container").className = "loading";
    url = generate_report_endpoint;
    url += getParams("reportID", window.location.href)
    url += "&xml="
    var xml = '<params '
    for (let i = 0; i < params.length; i++) {
        xml += params[i] + " = \"" + document.getElementById(params[i]).value + "\" ";
    }
    xml += "/>";
    console.log(xml);
    url += encodeURIComponent(xml);
    httpGetAsync(url, updateReport)
}

function processDate(epochTime){
    var date = new Date(epochTime * 1000);
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    return date.toLocaleString("en-US", options);
}

function updateReport(responseBody){
    var json = JSON.parse(responseBody);
    console.log(json);
    if(json[0].hasOwnProperty(chart_key)){
        console.log(json[0][chart_key]);
        updateChart(json[0][chart_key]);
        json = json[0][table_key];
    }
    var table_html = '';
    var column_names = "<tr> <th class=\"unselectable\"></th>";
    for (i=0 ; i<Object.keys(json[0]).length ; i++){
        if (Object.keys(json[0])[i] != row_number_column_name){
            var col_name = Object.keys(json[0])[i];
            const column_format_regex = '{.*}'
            if(col_name.match(column_format_regex))
                col_name = col_name.replace(col_name.match(column_format_regex),'');
            column_names += "<th class=\"unselectable\">"+col_name+"</th>"
        }
    }
    column_names += "</th>";
    var rows = [];
    table_html += column_names;
    var index = 1;
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            row_html = "<tr> <td class=\"serial unselectable\">[SERIAL]</td>";
            for (i=0 ; i < Object.keys(json[key]).length; i++){
                if (Object.keys(json[key])[i] != row_number_column_name){
                    var col_name = Object.keys(json[key])[i];
                    var col_data = json[key][col_name];
                    if(col_name.includes("{DATE}")){
                        if (col_data != "NULL")
                            col_data = processDate(col_data);
                    }
                    if (col_data == "NULL")
                        col_data = " - ";
                    row_html += "<td>" + col_data + "</td>";
                }
                if(Object.keys(json[key]).indexOf(row_number_column_name) > 0){
                    index = json[key][row_number_column_name];
                }else{
                    index = -1;
                }
            }
            row_html += "</tr>";
        }
        if(index == -1){
            rows[Object.keys(rows).length+1] = row_html;
        }
        else{
            rows[index] = row_html;
        }
        //table_html += row_html;
    }
    //reindex the rows list as the indices may not be sequential
    rows = rows.filter(val => val)

    for (i=0 ; i<Object.keys(rows).length ; i++){
        table_html += rows[i].replace("[SERIAL]", i+1);
    }
    document.getElementById("reports_table").innerHTML = table_html;
    document.getElementById("loading_container").className = "invisible";
}

function updateChart(chartData){
    console.log("handle chart");
    var data_array =[['','']];
    for(var i=0; i < chartData.length; i++){
        data_array.push(Object.values(chartData[i]));
    }
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    document.getElementById("report_chart").className = "visible";

    function drawChart() {
        var data = google.visualization.arrayToDataTable(data_array);
        
        var options = {
        animation: {
                  duration: 1000,
                  easing: 'out',
                  startup: true
              },
              fontName:"Inria Sans"
        };
        
        var chart = new google.visualization.PieChart(document.getElementById('report_chart'));
          chart.draw(data, options);
        }   
}
