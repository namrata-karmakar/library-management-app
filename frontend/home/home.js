var dash_stats_endpoint = "http://localhost:8080/dashboard";
var defaulters_endpoint = "http://localhost:8080/defaulters?page=0";

window.onload = httpGetAsync(dash_stats_endpoint, updateStats);
window.onload = httpGetAsync(defaulters_endpoint, updateTop5Defaulters);

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

function updateStats(responseBody) {
  const json = JSON.parse(responseBody);
  document.getElementById("book_stats_borrowed").innerHTML = json[0].Borrowed;
  var match = Array.from(document.getElementsByClassName("book_stats_overdue"));
  match.forEach((element) => (element.innerHTML = json[0].Overdue));
  document.getElementById("book_stats_no_copies").innerHTML =
    json[0].NoPhysicalCopy;
  document.getElementById("total_fine_value").innerHTML =
    "€ " + json[0].TotalFine;
}

function updateTop5Defaulters(responseBody) {
  const json = JSON.parse(responseBody);
  var inject_html = "";
  for (var key in json) {
    var html = `<tr>
                    <td>[NAME]</td>
                    <td class="td_right">€ [FINE]</td>
                </tr>`;
    html = html.replace(
      "[NAME]",
      json[key].FirstName + " " + json[key].LastName
    );
    html = html.replace("[FINE]", json[key].FineIncurred);
    inject_html += html;
  }
  document.getElementById("defulters_calender_table").innerHTML += inject_html;
}

function open(url) {
  window.location.href = url;
}
function openManageBooks() {
  open("../books/books.html");
}

function openBooksWithoutCopies() {
  open("../books/books.html?table_only=1");
}

function openManageAuthors() {
  open("../authors/author.html");
}

function openManageUsers() {
  open("../users/user.html");
}

function openViewReports() {
  open("../reports/reports.html");
}

async function searchBorrowersByName(searchString) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/searchBorrowers?query=${searchString}`,
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

async function getBorrowerDetailsByBorrowerId(borrowerId) {
  try {
    const response = await commonFetchApi({
      url: `http://localhost:8080/borrower?id=${borrowerId}`,
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

async function issueBookApiCall(bookId, borrowerId) {
  try {
    const jsonData = {
      BookID: bookId,
      BorrowerID: borrowerId,
    };
    const response = await commonFetchApi({
      url: `http://localhost:8080/issue`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function returnBookApiCall(bookId, borrowerId, damagedOrLostBy) {
  try {
    const jsonData = {
      BookID: bookId,
      BorrowerID: borrowerId,
      IsDamagedOrLost: damagedOrLostBy,
    };
    const response = await commonFetchApi({
      url: `http://localhost:8080/return`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function showBorrowerDetails() {
  try {
    const searchString = document.getElementById(
      "search_bar_field_borrower"
    ).value;
    const borrowers = await searchBorrowersByName(searchString);
    listOfBorrowedBooks.innerHTML = "";
    if (Array.isArray(borrowers)) {
      const div = document.getElementById("errorMessage");
      if (div !== null) {
        div.parentNode.removeChild(div);
      }
      borrowers.map((borrower) => {
        if (borrower.BorrowerType === "S") {
          borrower.BorrowerType = "Student";
        } else if (borrower.BorrowerType === "F") {
          borrower.BorrowerType = "Faculty";
        }
      });
      const trStrings = borrowers.map(
        (borrower) => `
        <div class="borrowerDetailsContainer">
          <div class="borrowerDetailsRow">
            <a
              class="borrowerDetails"
              title="Click here to issue books to this borrower"
              onclick="showIssueBooksContent(${borrower.BorrowerID})"
            >
              <p>${borrower.FirstName} ${borrower.LastName}</p>
              <p>|</p>
              <p>${borrower.BorrowerType}</p>
            </a>
            <button
              class="angleDownButton"
              title="Click here to view books issued details"
              type="button"
              onclick="showBorrowerBookDetails(${borrower.BorrowerID})"
            >
              <i class="fa-solid fa-angle-down"></i>
            </button>
          </div>
          <div
            id="listOfBorrowedBooks_${borrower.BorrowerID}"
            class="listOfBorrowedBooks"
          ></div>
          <div id="messageReturnBooks"></div>
        </div>
        `
      );
      const trHTMLString = trStrings.reduce((acc, curr) => acc + curr);
      document.getElementById(
        "listOfBorrowersContainer"
      ).innerHTML = `<div id="listOfBorrowers">
        <h4>Borrowers</h4>
        ${trHTMLString}
      </div`;
    } else {
      const div = document.getElementById("listOfBorrowers");
      if (div !== null) {
        div.parentNode.removeChild(div);
      }
      const errorMessage = borrowers;
      document.getElementById("errorMessageContainer").innerHTML = `
        <p id="errorMessage" class="error">${errorMessage}</p>
      `;
    }
  } catch (error) {
    console.error(
      `[ERROR][showBorrowerDetails] ${error.message} - ${error.stack}`
    );
  }
}

async function showBorrowerBookDetails(borrowerId) {
  try {
    const listOfBorrowedBooks = document.getElementById(
      `listOfBorrowedBooks_${borrowerId}`
    );
    const borrowerDetails = await getBorrowerDetailsByBorrowerId(borrowerId);
    if (borrowerDetails[0].hasOwnProperty("Books")) {
      const borrowedBookDetails = borrowerDetails[0].Books;
      borrowedBookDetails.map((book) => {
        const dateOfIssue = book.DateOfIssue;
        book.DateOfIssue = convertToDate(dateOfIssue);
      });
      const trStrings = borrowedBookDetails.map(
        (book) => `
          <tr>
            <td>${book.Title}</td>
            <td>&euro; ${book.Fine}</td>
            <td>${book.DateOfIssue}</td>
            <td>${book.DurationOfLoan}</td>
            <td>
              <button
                class="btn"
                title="Click here to return this book"
                type="button"
                onclick="returnBook(${book.BookID}, ${borrowerId}, 0)"
              >
                Return Book
              </button>
            </td>
            <td>
              <button
                class="btn"
                title="Click here to mark this book as damaged or lost"
                type="button"
                onclick="returnBook(${book.BookID}, ${borrowerId}, 1)"
              >
                Mark Damaged/Lost
              </button>
            </td>
          </tr>`
      );
      const trHTMLString = trStrings.reduce((acc, curr) => acc + curr);
      listOfBorrowedBooks.innerHTML = `
        <table>
          <thead>
            <tr>
              <th scope="col">Book Issued</th>
              <th scope="col">Fine</th>
              <th scope="col">Date of Issue</th>
              <th scope="col">Duration Of Loan</th>
            </tr>
          </thead>
          ${trHTMLString}
        </table>`;
    } else {
      listOfBorrowedBooks.innerHTML = `
        <p>This borrower has not issued any books!</p>`;
    }
    if (window.getComputedStyle(listOfBorrowedBooks).display === "none") {
      listOfBorrowedBooks.style.display = "block";
    } else {
      listOfBorrowedBooks.style.display = "none";
    }
  } catch (error) {
    console.error(
      `[ERROR][showBorrowerBookDetails] ${error.message} - ${error.stack}`
    );
  }
}

async function showIssueBooksContent(borrowerId) {
  try {
    const borrowerDetailsElement = document.getElementById("borrower");
    const borrowerDetails = await getBorrowerDetailsByBorrowerId(borrowerId);
    const borrowerFullName = `${borrowerDetails[0].Borrower[0].FirstName} ${borrowerDetails[0].Borrower[0].LastName}`;
    let searchBooks = `
      <h3>Issuing books to ${borrowerFullName}</h3>
      <div id="search_bar">
        <input
          id="search_bar_field_book"
          type="search"
          minlength="3"
          placeholder="Search Book..."
        />
        <button
          id="search_bar_button"
          type="button"
          onclick="showBookDetails(${borrowerId})"
        >
          Search
        </button>
      </div>
      <div id="errorMessageSearchBooks"></div>
      <div id="listOfBooksContainer" class="booksContainer"></div>
      <div id="messageIssueBooks"></div>`;
    borrowerDetailsElement.innerHTML = searchBooks;
  } catch (error) {
    console.error(
      `[ERROR][showIssueBooksContent] ${error.message} - ${error.stack}`
    );
  }
}

async function showBookDetails(borrowerId) {
  try {
    const searchString = document.getElementById("search_bar_field_book").value;
    const books = await searchBooksByName(searchString);
    if (Array.isArray(books)) {
      const div = document.getElementById("errorMessageBooks");
      if (div !== null) {
        div.parentNode.removeChild(div);
      }
      const trStrings = books.map(
        (book) => `
          <tr>
            <td>${book.Title}</td>
            <td>${book.Authors[0].AuthorName}</td>
            <td>${book.AvailableCopies}</td>
            <td>
              <button
                class="btn"
                title="Click here to issue this book"
                type="button"
                onclick="issueBook(${book.BookID}, ${borrowerId})"
              >
                Issue Book
              </button>
            </td>
          </tr>`
      );
      const trHTMLString = trStrings.reduce((acc, curr) => acc + curr);
      document.getElementById("listOfBooksContainer").innerHTML = `<div>
            <table id="listOfBooks">
              <thead>
                <tr>
                  <th scope="col">Book</th>
                  <th scope="col">Author</th>
                  <th scope="col">Copies Available</th>
                </tr>
              </thead>
              ${trHTMLString}
            </table>
          </div`;
    } else {
      const div = document.getElementById("listOfBooks");
      if (div !== null) {
        div.parentNode.removeChild(div);
      }
      const errorMessage = books;
      document.getElementById("errorMessageSearchBooks").innerHTML = `
        <p id="errorMessageBooks" class="error">${errorMessage}</p>
      `;
    }
  } catch (error) {
    console.error(`[ERROR][showBookDetails] ${error.message} - ${error.stack}`);
  }
}

async function issueBook(bookId, borrowerId) {
  try {
    const response = await issueBookApiCall(bookId, borrowerId);
    const bookDetails = (await getBookDetailsByBookId(bookId))[0];
    const borrowerDetails = (
      await getBorrowerDetailsByBorrowerId(borrowerId)
    )[0].Borrower[0];
    const messageElement = document.getElementById("messageIssueBooks");
    if (response === "OK") {
      if (messageElement !== null) {
        messageElement.classList.remove("error");
      }
      messageElement.classList.add("success");
      messageElement.innerHTML = `
      The book <b>"${bookDetails.Title}"</b> has been issued to borrower <b>"${borrowerDetails.FirstName} ${borrowerDetails.LastName}."</b>`;
      // setTimeout(reloadWindow, 3000);
    } else {
      if (messageElement !== null) {
        messageElement.classList.remove("success");
      }
      messageElement.classList.add("error");
      messageElement.innerHTML = response;
      //setTimeout(reloadWindow, 3000);
    }
  } catch (error) {
    console.error(`[ERROR][issueBook] ${error.message} - ${error.stack}`);
  }
}

async function returnBook(bookId, borrowerId, damagedOrLostBy) {
  try {
    console.log("damagedOrLostBy", damagedOrLostBy)
    const response = await returnBookApiCall(
      bookId,
      borrowerId,
      damagedOrLostBy
    );
    const bookDetails = (await getBookDetailsByBookId(bookId))[0];
    const borrowerDetails = (
      await getBorrowerDetailsByBorrowerId(borrowerId)
    )[0].Borrower[0];
    messageElement = document.getElementById("messageReturnBooks");
    if (response === "OK") {
      if (messageElement !== null) {
        messageElement.classList.remove("error");
      }
      messageElement.classList.add("success");
      if (damagedOrLostBy === 0) {
        messageElement.innerHTML = `
        <p class="messageReturnBooks">
          The book <b>"${bookDetails.Title}"</b> has been returned by borrower <b>"${borrowerDetails.FirstName} ${borrowerDetails.LastName}."</b>
        </p>`;
      } else {
        messageElement.innerHTML = `
        <p class="messageReturnBooks"> 
          The book <b>"${bookDetails.Title}"</b> has been marked as damaged/lost by borrower <b>"${borrowerDetails.FirstName} ${borrowerDetails.LastName}. Please collect 20 Euros."</b>
        </p>`;
      }
      // setTimeout(reloadWindow, 3000);
    } else {
      if (messageElement !== null) {
        messageElement.classList.remove("success");
      }
      messageElement.classList.add("error");
      messageElement.innerHTML = response;
      // setTimeout(reloadWindow, 3000);
    }
  } catch (error) {
    console.error(`[ERROR][returnBook] ${error.message} - ${error.stack}`);
  }
}

const modal = document.getElementById("modal");
const btn = document.getElementById("issue-book");
const span = document.getElementsByClassName("close")[0];
btn.onclick = function () {
  modal.style.display = "block";
};
span.onclick = function () {
  modal.style.display = "none";
  reloadWindow();
};
window.onclick = function (event) {
  console.log("event", event);
  if (event.target == modal) {
    modal.style.display = "none";
    reloadWindow();
  }
};

function convertToDate(unixTimestamp) {
  const milliseconds = unixTimestamp * 1000;
  const dateObject = new Date(milliseconds);
  const readableDateFormat = dateObject.toLocaleDateString();
  return readableDateFormat;
}

function reloadWindow() {
  window.location.reload();
}
