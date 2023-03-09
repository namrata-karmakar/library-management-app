var count = 0;
var borrowers_page_endpoint = "http://localhost:8080/borrowers?page=";


window.onload = startUp();

function getParams( name, url_string ) {
    var url = new URL(url_string);
    var c = url.searchParams.get(name);
    return(c);
}

function startUp(){
    count = 0;
    httpGetAsync(borrowers_page_endpoint+count, updatePage);
}

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
        if(xmlHttp.readyState == 4 && xmlHttp.status == 0) {
            console.log("network error");
        }
    }
    xmlHttp.open("GET", URL, true); // true for asynchronous 
    xmlHttp.send(null);
}

function updatePage(responseBody){
    const json = JSON.parse(responseBody);
    var inject_html = ""
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            var html = `<tr>
                            <td class="userRow">
								<div class="user_info">
									<p class="user_info_name unselectable">[NAME]</p>
									<p class="user_info_divider unselectable">|</p>
									<p class="unselectable">&euro; [FINE]</p>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</div>
								<span class="action_button_span">
									<span class="manage_button" onclick="editUser([USER_ID]);">Edit</span>
									<span class="manage_button" onclick="deleteUser([USER_ID]);">Remove</span>
								</span>
                            </td>
                        </tr>`
            html = html.replace('[NAME]', json[key].FirstName+" "+json[key].LastName);
            html = html.replace('[FINE]', String(json[key].FineIncurred));
			html = html.replaceAll('[USER_ID]', json[key].BorrowerID);
            inject_html += html;
            document.getElementById("loading_container").className = "invisible";
        }
    }
    document.getElementById("user_feed").innerHTML += inject_html;
}

window.onscroll = function(_ev) {
  
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
       
        if(count >= 0){
            count += 1;
            httpGetAsync(borrowers_page_endpoint+count, updatePage);
        }
    }
};


// Get the modal
var modal = document.getElementById("action_modal");

// Get the button that opens the modal
var btn = document.getElementById("add_user");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  resetModal();
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    resetModal();
    modal.style.display = "none";
  }
}


$(document).ready(function(){

	$("#edit_user").hide();
	
	$("#edit_user").click(updateUser);
	
	$("#create_user").click(function(){
		createUser();
	}); 
	
	$("#search_bar_button").click(function() {
		var query = $("#search_bar_field").val();
		var URL = 'http://localhost:8080/searchBorrowers?page=0&query=' + query;
		
		if(query.length == 0) {
			$("#user_feed tbody").html("");
			startUp();
			return;
		} else if(query.length < 3) {
			alert("Enter at least 3 chracters");
		}
		
		$.ajax({
			url: URL,
			type: "GET",
			dataType: 'json',
			success: function(responseBody) {
				$("#user_feed tbody").html("");
				updatePage(JSON.stringify(responseBody));
			},
			error: function(error){
				console.log(error);
			},
		});
	});
	
});

function getTimestamp(dateStr){
	var date = new Date(dateStr);
	var timestampInSeconds = Math.floor(date.getTime() / 1000);
	return timestampInSeconds;
}

function createUser() {
	var fname = $("#fname").val();
	var lname = $("#lname").val();
	var dateStr = $("#date").val();
	var phone = $("#phone").val();
	var email = $("#email").val();
	var borrower_type = $("#borrower_type").val();
	
	console.log(fname + " : " + lname + " : " + getTimestamp(dateStr) + " : " + phone + " : " + email + " : " + borrower_type);

	var jsonData = {
		"FirstName": fname,
		"LastName": lname,
		"DateOfBirth": getTimestamp(dateStr),
		"ContactPhone": phone,
		"ContactEmail": email,
		"BorrowerType": borrower_type		
	}
	$.ajax({
        url: "http://localhost:8080/borrower",
        type: "POST",
		contentType: 'application/json',
		data: JSON.stringify(jsonData),
        success: function(response) {
            location.reload();
        },
		error: function(error){
			console.log(error);
		},
    });
}



function deleteUser(userId) {
	var deleteUserConfirm = confirm("Are you sure you want to delete?");
	
	if(deleteUserConfirm) {
		$.ajax({
			url: "http://localhost:8080/borrower?id="+userId,
			type: "DELETE",
			success: function(response) {
				location.reload();
			},
			error: function(error){
				console.log(error);
			},
		});		
	}
}

function editUser(userId) {
	$("#current_edit_user").val(userId);
	
	$("#create_user").hide();
	$("#edit_user").show();

	$.ajax({
        url: "http://localhost:8080/borrower?id=" + userId,
        type: "GET",
        success: function(jsonResponse) {
            $("#action_modal").show();
			
			$("#fname").val(jsonResponse[0]['Borrower'][0]['FirstName']);
			$("#lname").val(jsonResponse[0]['Borrower'][0]['LastName']);
			var timestamp = jsonResponse[0]['Borrower'][0]['DateOfBirth']
			// var date = getDate(timestamp);
			// $("#date_of_birth").val(date);
			$("#phone").val(jsonResponse[0]['Borrower'][0]['ContactPhone']);
			$("#email").val(jsonResponse[0]['Borrower'][0]['ContactEmail']);
			$("#borrower_type").val(jsonResponse[0]['Borrower'][0]['BorrowerType']);

        },
		error: function(error){
			console.log(error);
		},
    });
	
}

function updateUser() {
		var userId = $("#current_edit_user").val();
		var fname = $("#fname").val();
		var lname = $("#lname").val();
		var dateStr = $("#date").val();
		var phone = $("#phone").val();
		var email = $("#email").val();
		var borrower_type = $("#borrower_type").val();

		var jsonData = {
						"BorrowerID" : userId,
						"FirstName": fname,
						"LastName": lname,
						"DateOfBirth": getTimestamp(dateStr),
						"ContactPhone": phone,
						"ContactEmail": email,
						"BorrowerType": borrower_type
					   }
		
		$.ajax({
			url: "http://localhost:8080/editBorrower",
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(jsonData),
			success: function(response) {
				location.reload();
			},
			error: function(error){
				console.log(error);
			},
		});
}

function resetModal() {
	$("#fname").val("");
	$("#lname").val("");
	$("#date").val("");
	$("#phone").val("");
	$("#email").val("");
	$("#address").val("");
	$("#country").val("");

	$("#create_user").show();
    $("#edit_user").hide();
}
