var count = 0;
var books_page_endpoint = "http://localhost:8080/books?page=";

function getParams(name, url_string) {
  var url = new URL(url_string);
  var c = url.searchParams.get(name);
  return c;
}

function startUp() {
  if (getParams("table_only", window.location.href) == 1) {
    document.getElementById("non_table").className = "invisible";
    document.getElementById("table_title").innerHTML =
      "Books without any copies";
  }
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
  };
  xmlHttp.open("GET", URL, true); // true for asynchronous
  xmlHttp.send(null);
}

async function searchBooksByName(searchString) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/searchBooks?page=0&query=${searchString}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getAuthorsByPage(pageNo) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/authors?page=${pageNo}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getBooksByPage(pageNo) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/books?page=${pageNo}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getAllRestrictions() {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/restrictions`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function createNewBook(createBookDto) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/book`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBookDto),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function createNewRestriction(createRestrictionDto) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/restriction`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createRestrictionDto),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getBookDetailsByBookId(bookId) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/book?id=${bookId}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function editBook(editBookDto) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/editBook`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editBookDto),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function insertCopies(insertCopiesDto) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/copy`,
      method: "POST",
      body: insertCopiesDto,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function markCopyAsDamaged(markCopyAsDamagedDto) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/markDamage`,
      method: "POST",
      body: markCopyAsDamagedDto,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

function updatePage(responseBody) {
  const json = JSON.parse(responseBody);
  var inject_html = "";
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      var html = `<tr>
                    <td class="book_tn_col">
                      <img class="book_thumbnail unselectable" src="${json[key].CoverURL}" />
                    </td>
                    <td class="bookRow">
                      <div class="book_info">
                        <p class="book_info_title unselectable">${json[key].Title}</p>
                        <p class="book_info_divider unselectable">|</p>
                        <p class="book_info_secondary unselectable">${json[key].Authors[0].AuthorName}</p>
                        <p class="book_info_divider unselectable">|</p>
                        <p class="book_info_secondary unselectable">${json[key].Year}</p>
                        <p class="book_info_tag">${json[key].ISBN}</p>
                        <p class="book_info_tag unselectable">${json[key].AvailableCopies} Copies</p>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                      <span>
                        <span class="manage_button" onclick="editModalOpen(${json[key].BookID});">Edit</span>
                      </span>
                    </td>
                  </tr>`;
      var book_name = "";
      for (var book in json[key].Books) {
        if (json.hasOwnProperty(book)) {
          if (book_name.length > 0) {
            book_name += ", ";
          }
          book_name += json[key].Book[book].BookName;
        }
      }
      html = html.replace("[BOOK]", book_name);
      inject_html += html;
      document.getElementById("loading_container").className = "invisible";
    }
  }
  document.getElementById("book_feed").innerHTML += inject_html;
}

window.onload = startUp();

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

// Add book start *************************************

// Get the modal
var modal = document.getElementById("action_modal");

// Get the button that opens the modal
var addBookBtn = document.getElementById("add_book");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

const selectAuthor = document.getElementById("author");
const selectBook = document.getElementById("book");
const selectBookInMarkCopy = document.getElementById("book_mark_copy");

// When the user clicks the button, open the modal
addBookBtn.onclick = async function () {
  modal.style.display = "block";
  restrictionFieldSet.style.display = "none";
  document.getElementById("create_book").style.display = "block";
  document.getElementById("edit_book").style.display = "none";
  try {
    await compileAuthors();
    await compileRestrictions();
  } catch (error) {
    console.error(`[ERROR] ${error.message} - ${error.stack}`);
  }
};

async function compileAuthors() {
  try {
    let count = 0;
    let authorsInPage = await getAuthorsByPage(count);
    let authors = authorsInPage;
    while (authorsInPage !== "No more authors to display") {
      count++;
      authorsInPage = await getAuthorsByPage(count);
      if (authorsInPage !== "No more authors to display") {
        authorsInPage.map((author) => {
          authors.push(author);
        });
      }
    }
    authors.map((author) => {
      selectAuthor.options[selectAuthor.options.length] = new Option(
        `${author.FirstName} ${author.LastName}`,
        `${author.AuthorID}`
      );
    });
  } catch (error) {
    throw error;
  }
}

const selectRestriction = document.getElementById("restriction");
async function compileRestrictions() {
  try {
    document.getElementById("restriction").innerHTML = "";
    const restrictions = await getAllRestrictions();
    restrictions.splice(0, 1);
    selectRestriction.options[selectRestriction.options.length] = new Option(
      `Select Restriction (Optional)`, `1`);
    selectRestriction.options[selectRestriction.options.length] = new Option(
      `Custom`, `Custom`);
    restrictions.map((restriction) => {
      selectRestriction.options[selectRestriction.options.length] = new Option(
        `${restriction.Restriction}`.replace(/^,/, ""),
        `${restriction.RestrictionID}`
      );
    });
    return restrictions;
  } catch (error) {
    throw error;
  }
}

async function compileBooks() {
  try {
    let count = 0;
    let booksInPage = await getBooksByPage(count);
    let books = booksInPage;
    while (booksInPage !== "No more books to display") {
      count++;
      booksInPage = await getBooksByPage(count);
      if (booksInPage !== "No more books to display") {
        booksInPage.map((book) => {
          books.push(book);
        });
      }
    }
    books.map((book) => {
      selectBook.options[selectBook.options.length] = new Option(
        `${book.Title}`,
        `${book.BookID}`
      );
      selectBookInMarkCopy.options[selectBookInMarkCopy.options.length] =
        new Option(`${book.Title}`, `${book.BookID}`);
    });
  } catch (error) {
    throw error;
  }
}

const restrictionFieldSet = document.getElementById("restrictionFieldSet");

function onRestrictionChange() {
  const value = selectRestriction.value;
  if (value === "Custom") {
    restrictionFieldSet.style.display = "block";
  } else {
    restrictionFieldSet.style.display = "none";
  }
}

async function onCreateBook() {
  try {
    const title = document.getElementById("title").value;
    const imageUrl = document.getElementById("i_book_image").value;
    const isbn = parseInt(document.getElementById("isbn").value);
    const year = parseInt(document.getElementById("year").value);
    const authorId = parseInt(document.getElementById("author").value);
    let restriction = document.getElementById("restriction").value;
    let createBookDto = null;
    if (
      title === "" ||
      imageUrl === "" ||
      isbn === "" ||
      year === "" ||
      authorId === ""
    ) {
      alert("Please enter all details!");
    }
    if (restriction === "Custom") {
      const maxLoanDays = document.getElementById("MaxLoanDays").value;
      const minAge = document.getElementById("MinAge").value;
      const availabilityEndDate = document.getElementById(
        "AvailabilityEndDate"
      ).value;
      restriction = await onCreateRestriction(
        maxLoanDays,
        minAge,
        availabilityEndDate
      );
      createBookDto = {
        Title: title,
        AuthorIDs: [authorId],
        Year: year,
        CoverURL: imageUrl,
        RestrictionsID: restriction,
        ISBN: isbn,
      };
    } else if (restriction === "0") {
      createBookDto = {
        Title: title,
        AuthorIDs: [authorId],
        Year: year,
        CoverURL: imageUrl,
        RestrictionsID: 1,
        ISBN: isbn,
      };
    } else {
      createBookDto = {
        Title: title,
        AuthorIDs: [authorId],
        Year: year,
        CoverURL: imageUrl,
        RestrictionsID: restriction,
        ISBN: isbn,
      };
    }
    const response = await createNewBook(createBookDto);
    const bookDetails = (await getBookDetailsByBookId(parseInt(response)))[0];
    reloadWindow();
    alert(`The book "${bookDetails.Title}" has been added to the library.`);
  } catch (error) {
    console.error(`[ERROR][onCreateBook] ${error.message} - ${error.stack}`);
  }
}

async function onCreateRestriction(maxLoanDays, minAge, availabilityEndDate) {
  try {
    if (maxLoanDays === "") {
      maxLoanDays = null;
    } else if (minAge === "") {
      minAge = null;
    } else if (availabilityEndDate === "") {
      availabilityEndDate = null;
    }
    if (availabilityEndDate) {
      availabilityEndDate = convertToUnixTimestamp(availabilityEndDate);
    }
    if (maxLoanDays === "" && minAge === "" && availabilityEndDate === "") {
      alert("Enter atleast one value for restrictions!");
    }
    const createRestrictionDto = {
      MaxLoanDays: maxLoanDays,
      MinAge: minAge,
      AvailabilityEndDate: availabilityEndDate,
    };
    return await createNewRestriction(createRestrictionDto);
  } catch (error) {
    throw error;
  }
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  reloadWindow();
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    reloadWindow();
    modal.style.display = "none";
  }
};

// Add book End *************************************

// Edit book start *************************************

async function editModalOpen(bookId) {
  modal.style.display = "block";
  restrictionFieldSet.style.display = "none";
  document.getElementById("create_book").style.display = "none";
  document.getElementById("edit_book").style.display = "block";
  try {
    await compileAuthors();
    const restrictions = await compileRestrictions();
    const restrictionName = restrictions.filter(
      (restriction) =>
        restriction.Restriction === document.getElementById("restriction").value
    );
    const bookDetails = (await getBookDetailsByBookId(bookId))[0];
    document.getElementById("title").value = bookDetails.Title;
    document.getElementById("i_book_image").value = bookDetails.CoverURL;
    document.getElementById("isbn").value = bookDetails.ISBN;
    document.getElementById("year").value = bookDetails.Year;
    document.getElementById("author").value = bookDetails.Authors[0].AuthorID;
    document.getElementById("year").value = bookDetails.Year;
    document.getElementById("restriction").value = bookDetails.RestrictionsID;
    document.getElementById("restriction").text = restrictionName;
    const updateBook = document.getElementById("edit_book");
    updateBook.addEventListener("click", async function () {
      await onEditBook(bookId);
    });
  } catch (error) {
    console.error(`[ERROR][editModalOpen] ${error.message} - ${error.stack}`);
  }
}

async function onEditBook(bookId) {
  try {
    const title = document.getElementById("title").value;
    const imageUrl = document.getElementById("i_book_image").value;
    const isbn = parseInt(document.getElementById("isbn").value);
    const year = parseInt(document.getElementById("year").value);
    const authorId = parseInt(document.getElementById("author").value);
    let restriction = document.getElementById("restriction").value;
    let editBookDto = null;
    if (
      title === "" ||
      imageUrl === "" ||
      isbn === "" ||
      year === "" ||
      authorId === ""
    ) {
      alert("Please enter all details!");
    }
    if (restriction === "Custom") {
      const maxLoanDays = document.getElementById("MaxLoanDays").value;
      const minAge = document.getElementById("MinAge").value;
      const availabilityEndDate = document.getElementById(
        "AvailabilityEndDate"
      ).value;
      restriction = await onCreateRestriction(
        maxLoanDays,
        minAge,
        availabilityEndDate
      );
      editBookDto = {
        BookID: bookId,
        Title: title,
        AuthorIDs: [authorId],
        Year: year,
        CoverURL: imageUrl,
        RestrictionsID: restriction,
        ISBN: isbn,
      };
    } else if (restriction === "0") {
      editBookDto = {
        BookID: bookId,
        Title: title,
        AuthorIDs: [authorId],
        Year: year,
        CoverURL: imageUrl,
        RestrictionsID: 1,
        ISBN: isbn,
      };
    } else {
      editBookDto = {
        BookID: bookId,
        Title: title,
        AuthorIDs: [authorId],
        Year: year,
        CoverURL: imageUrl,
        RestrictionsID: restriction,
        ISBN: isbn,
      };
    }
    await editBook(editBookDto);
    const bookDetails = (await getBookDetailsByBookId(bookId))[0];
    alert(`The book "${bookDetails.Title}" has been updated.`);
    reloadWindow();
  } catch (error) {
    throw error;
  }
}

// Edit book End *************************************

// Add Copies Code Start *************************************

// Get the modal
var addCopyModal = document.getElementById("action_modal_add_copies");

// Get the button that opens the modal
var btn_add_copies = document.getElementById("add_copies");

// Get the <span> element that closes the modal
var addCopySpan = document.getElementsByClassName("add_copy_close")[0];

// When the user clicks the button, open the modal
btn_add_copies.onclick = async function () {
  addCopyModal.style.display = "block";
  try {
    await compileBooks();
  } catch (error) {
    console.error(`[ERROR] ${error.message} - ${error.stack}`);
  }
};

const insertCopiesButton = document.getElementById("insert_copies");
insertCopiesButton.onclick = async function () {
  try {
    const bookId = document.getElementById("book").value;
    const noOfCopies = document.getElementById("noOfCopies").value;
    let formData = new FormData();
    formData.append("Bookid", bookId);
    formData.append("Copies", noOfCopies);
    const response = await insertCopies(formData);
    alert(response);
    reloadWindow();
  } catch (error) {
    console.error(`[ERROR] ${error.message} - ${error.stack}`);
  }
};

// When the user clicks on <span> (x), close the modal
addCopySpan.onclick = function () {
  reloadWindow();
  addCopyModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == addCopyModal) {
    reloadWindow();
    addCopyModal.style.display = "none";
  }
};

// Add Copies Code End *************************************

// Mark copy as damaged Start *************************************

// Get the modal
var markCopyModal = document.getElementById("action_modal_mark_copy");

// Get the button that opens the modal
var btn_mark_copy_as_damaged = document.getElementById("mark_copy_as_damaged");

// Get the <span> element that closes the modal
var markCopySpan = document.getElementsByClassName("mark_copy_close")[0];

// When the user clicks the button, open the modal
btn_mark_copy_as_damaged.onclick = async function () {
  markCopyModal.style.display = "block";
  try {
    await compileBooks();
  } catch (error) {
    console.error(`[ERROR] ${error.message} - ${error.stack}`);
  }
};

const markCopyButton = document.getElementById("mark_copy");
markCopyButton.onclick = async function () {
  try {
    const bookId = document.getElementById("book_mark_copy").value;
    let formData = new FormData();
    formData.append("bookID", bookId);
    const response = await markCopyAsDamaged(formData);
    if (response === "OK") {
      const bookDetails = (await getBookDetailsByBookId(parseInt(bookId)))[0];
      alert(
        `A copy of the book ${bookDetails.Title} has been marked as damaged by the library!`
      );
    } else {
      alert(response);
    }
    reloadWindow();
  } catch (error) {
    console.error(`[ERROR] ${error.message} - ${error.stack}`);
  }
};

// When the user clicks on <span> (x), close the modal
markCopySpan.onclick = function () {
  reloadWindow();
  markCopyModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == markCopyModal) {
    reloadWindow();
    markCopyModal.style.display = "none";
  }
};

function reloadWindow() {
  window.location.reload();
}

// Mark copy as damaged End *************************************

$(document).ready(function () {
  $("#search_bar_button").click(function () {
    var query = $("#search_bar_field_book").val();
    var URL = "http://localhost:8080/searchBooks?page=0&query=" + query;
    if (query.length == 0) {
      $("#book_feed tbody").html("");
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
          $("#book_feed tbody").html("<p>" + textStatus + "</p>");
        } else if (xhr.status == 200) {
          $("#book_feed tbody").html("");
          updatePage(JSON.stringify(responseBody));
        }
      },
      error: function (error) {
        // $("#book_feed tbody").html('<p>'+ error.responseText + '</p>');
        $("#book_feed tbody").html(
          "<p>Could not find any book named: " + query + "</p>"
        );
      },
    });
  });
});

function convertToUnixTimestamp(dateString) {
  const unixTimestamp = Math.floor(new Date(dateString).getTime() / 1000);
  return unixTimestamp;
}
