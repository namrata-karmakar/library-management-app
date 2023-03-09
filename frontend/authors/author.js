var count = 0;
var books_page_endpoint = "http://localhost:8080/authors?page=";

window.onload = startUp();

function getParams(name, url_string) {
  var url = new URL(url_string);
  var c = url.searchParams.get(name);
  return c;
}

function startUp() {
  count = 0;
  httpGetAsync(books_page_endpoint + count, updatePage);
}

function httpGetAsync(URL, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp.responseText);
    } else if (xmlHttp.status == 400) {
      count = -1;
    }
    if (xmlHttp.readyState == 4 && xmlHttp.status == 0) {
      console.log("network error");
    }
  };
  xmlHttp.open("GET", URL, true); // true for asynchronous
  xmlHttp.send(null);
}

function updatePage(responseBody) {
  const json = JSON.parse(responseBody);
  var inject_html = "";
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      var html = `<tr>
                    <td class="author_tn_col">
                      <img class="author_thumbnail unselectable" src="[IMAGE_URL]" />
                    </td>
                    <td class="authorRow">
                      <div class="author_info">
                        <p class="author_info_name unselectable">[NAME]</p>
                        <p class="author_info_divider unselectable">|</p>
                        <p class="unselectable">[COUNTRY]</p>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                      <span>
                        <span class="manage_button" onclick="editAuthor([AUTHOR_ID]);">Edit</span>
                        <span class="manage_button" onclick="deleteAuthor([AUTHOR_ID]);"
                          >Remove</span
                        >
                      </span>
                    </td>
                  </tr>`;
      html = html.replace("[IMAGE_URL]", json[key].ImageURL);
      html = html.replace(
        "[NAME]",
        json[key].FirstName + " " + json[key].LastName
      );
      html = html.replace("[COUNTRY]", json[key].Country);
      html = html.replaceAll("[AUTHOR_ID]", json[key].AuthorID);
      inject_html += html;
      document.getElementById("loading_container").className = "invisible";
    }
  }
  document.getElementById("author_feed").innerHTML += inject_html;
}

window.onscroll = function (ev) {
  //console.log("count:", count);
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    //console.log("you're at the bottom of the page");
    if (count >= 0) {
      count += 1;
      httpGetAsync(books_page_endpoint + count, updatePage);
    }
  }
};

// Get the modal
var modal = document.getElementById("action_modal");

// Get the button that opens the modal
var btn = document.getElementById("add_author");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  resetModal();
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    resetModal();
    modal.style.display = "none";
  }
};

$(document).ready(function () {
  $("#edit_author").hide();

  $("#edit_author").click(updateAuthor);

  $("#create_author").click(function () {
    createAuthor();
  });

  $("#search_bar_button").click(function () {
    var query = $("#search_bar_field").val();
    var URL = "http://localhost:8080/searchAuthors?page=0&query=" + query;

    if (query.length == 0) {
      $("#author_feed tbody").html("");
      startUp();
      return;
    } else if (query.length < 3) {
      alert("Enter at least 3 chracters");
    }

    $.ajax({
      url: URL,
      type: "GET",
      dataType: "json",
      success: function (responseBody, textStatus, xhr) {
        if (xhr.status == 400) {
          $("#author_feed tbody").html("<p>" + textStatus + "</p>");
        } else if (xhr.status == 200) {
          $("#author_feed tbody").html("");
          updatePage(JSON.stringify(responseBody));
        }
      },
      error: function (error) {
        // $("#author_feed tbody").html('<p>'+ error.responseText + '</p>');
        $("#author_feed tbody").html(
          "<p>Could not find any author named: " + query + "</p>"
        );
      },
    });
  });
});

function createAuthor() {
  var fname = $("#fname").val();
  var lname = $("#lname").val();
  //	var country = $("#country").val();
  var country = $("#country option:selected").text();
  var url = $("#i_author_image").val();

  console.log(fname + " : " + lname + " : " + country + " : " + url);

  var jsonData = {
    FirstName: fname,
    LastName: lname,
    Country: country,
    ImageURL: url,
  };

  $.ajax({
    url: "http://localhost:8080/author",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(jsonData),
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function deleteAuthor(authorId) {
  var deleteAuthorConfirm = confirm("Are you sure you want to delete?");

  if (deleteAuthorConfirm) {
    $.ajax({
      url: "http://localhost:8080/author?id=" + authorId,
      type: "DELETE",
      success: function (response) {
        location.reload();
      },
      error: function (error) {
        console.log(error);
      },
    });
  }
}

function editAuthor(authorId) {
  $("#current_edit_author").val(authorId);

  $("#create_author").hide();
  $("#edit_author").show();

  $.ajax({
    url: "http://localhost:8080/author?id=" + authorId,
    type: "GET",
    success: function (jsonResponse) {
      $("#action_modal").show();

      $("#fname").val(jsonResponse["FirstName"]);
      $("#lname").val(jsonResponse["LastName"]);
      $("#country").val(jsonResponse["Country"]);
      $("#i_author_image").val(jsonResponse["ImageURL"]);
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function updateAuthor() {
  var authorId = $("#current_edit_author").val();
  var fname = $("#fname").val();
  var lname = $("#lname").val();
  //		var country = $("#country").val();
  var country = $("#country option:selected").text();
  var url = $("#i_author_image").val();

  var jsonData = {
    AuthorID: authorId,
    FirstName: fname,
    LastName: lname,
    Country: country,
    ImageURL: url,
  };

  $.ajax({
    url: "http://localhost:8080/editAuthor",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(jsonData),
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function resetModal() {
  $("#fname").val("");
  $("#lname").val("");
  $("#country").val("");
  $("#i_author_image").val("");

  $("#create_author").show();
  $("#edit_author").hide();
}
