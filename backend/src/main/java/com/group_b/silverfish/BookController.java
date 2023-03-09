package com.group_b.silverfish;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.node.ObjectNode;

@CrossOrigin(maxAge = 3600) // add [origins = "http://domain.com"] once we have client infrastructure in
                            // place
@RestController
public class BookController {

    Database db = new Database();

    // insert an author
    @PostMapping("/author")
    public ResponseEntity<Object> CreateNewAuthor(@RequestBody Author newAuthor) {
        int authorID = db.CreateNewAuthor(newAuthor);
        if (authorID > 0)
            return ResponseEntity.ok(authorID);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while inserting author details!");
    }

    // view an author details
    @GetMapping("/author")
    public ResponseEntity<Object> getAuthorDetails(@RequestParam(value = "id") int AuthorID) {
        Author author = db.getAuthorDetails(AuthorID);
        if (author != null)
            return ResponseEntity.ok(author);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not find the requested author");
    }

    // get a page of authors
    @GetMapping("/authors")
    public ResponseEntity<Object> getAuthorPage(@RequestParam(value = "page") int pageNo) {
        List<ObjectNode> authors = db.getAuthorPage(pageNo);
        if (authors != null)
            return ResponseEntity.ok(authors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No more authors to display");
    }

    // update an author
    @PostMapping("/editAuthor")
    public ResponseEntity<Object> UpdateAuthor(@RequestBody Author author) {
        if(db.editAuthor(author)){
            return ResponseEntity.status(HttpStatus.OK).body("Updated author");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while updating author!");
    }
    
    // delete an author
    @DeleteMapping("/author")
    public ResponseEntity<Object> deleteAuthor(@RequestParam(value = "id") int authorID) {
        if(db.deleteAuthor(authorID)){
            return ResponseEntity.status(HttpStatus.OK).body("Deleted author");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to delete author");
    }
    
    // get books that match a serarch query on book title
    @GetMapping("/searchAuthors")
    public ResponseEntity<Object> searchAuthors(@RequestParam(value = "page") int pageNo,
                                                @RequestParam(value = "query") String searchQuery) {
        if(searchQuery.length() < 3){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter atleast 3 characters");
        }
        List<ObjectNode> books = db.searchAuthors(pageNo, searchQuery);
        if (books != null)
            return ResponseEntity.ok(books);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No more authors to display");
    }

    // create a restriction
    @PostMapping("/restriction")
    public ResponseEntity<Object> CreateNewRestriction(@RequestBody Restriction newRestriction) {
        int restrictionID = db.CreateNewRestriction(newRestriction);
        if (restrictionID > 0)
            return ResponseEntity.ok(restrictionID);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while creating restriction!");
    }

    // view restriction details
    @GetMapping("/restriction")
    public ResponseEntity<Object> getRestrictionDetails(@RequestParam(value = "id") int RestrictionID) {
        Restriction restriction = db.getRestrictionDetails(RestrictionID);
        if (restriction != null)
            return ResponseEntity.ok(restriction);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not find the requested restriction");
    }

    // get all restrictions
    @GetMapping(path = "/restrictions",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> viewAllRestrictions() {
        String resp = db.viewAllRestrictions();
        if (resp != null)
            return ResponseEntity.ok(resp);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not get restrictions");
    }

    // insert a book
    @PostMapping("/book")
    public ResponseEntity<Object> CreateNewBook(@RequestBody Book book) {
        int bookID = db.CreateNewBook(book);
        if (bookID > 0)
            return ResponseEntity.ok(bookID);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while inserting book!");
    }

    // get a page of books
    @GetMapping("/books")
    public ResponseEntity<Object> getBookPage(@RequestParam(value = "page") int pageNo) {
        List<ObjectNode> books = db.getBookPage(pageNo);
        if (books != null)
            return ResponseEntity.ok(books);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No more books to display");
    }

    // view a book details
    @GetMapping("/book")
    public ResponseEntity<Object> getBookDetails(@RequestParam(value = "id") int BookID) {
        List<ObjectNode> book = db.getBookDetails(BookID);
        if (book != null)
            return ResponseEntity.ok(book);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not find the requested book");
    }

    // update a book
    @PostMapping("/editBook")
    public ResponseEntity<Object> editBook(@RequestBody Book book) {
        if(db.editBook(book)){
            return ResponseEntity.status(HttpStatus.OK).body("Updated book");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while updating book!");
    }

    // get books that match a serarch query on book title
    @GetMapping("/searchBooks")
    public ResponseEntity<Object> searchBooks(@RequestParam(value = "page") int pageNo,
                                                @RequestParam(value = "query") String searchQuery) {
        if(searchQuery.length() < 3){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter atleast 3 characters");
        }
        List<ObjectNode> books = db.searchBooks(pageNo, searchQuery);
        if (books != null)
            return ResponseEntity.ok(books);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No more books to display");
    }

    //insert n copies of a book
    @PostMapping("/copy")
    public ResponseEntity<Object> insertCopies(@RequestParam(value = "Bookid") int BookID,
                                                @RequestParam(value = "Copies") int CopyCount) {
        if(db.insertCopies(BookID, CopyCount)){
            return ResponseEntity.status(HttpStatus.OK).body("Inserted copies");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not insert copies");
    }

    // insert a borrower
    @PostMapping("/borrower")
    public ResponseEntity<Object> CreateNewBorrower(@RequestBody Borrower newBorrower) {
        int borrowerID = db.CreateNewBorrower(newBorrower);
        if (borrowerID > 0)
            return ResponseEntity.ok(borrowerID);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while inserting borrower details!");
    }

    // update a borrower
    @PostMapping("/editBorrower")
    public ResponseEntity<Object> editBorrower(@RequestBody Borrower borrower) {
        if(db.editBorrower(borrower)){
            return ResponseEntity.status(HttpStatus.OK).body("Updated borrower");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while updating borrower!");
    }

    // delete an author
    @DeleteMapping("/borrower")
    public ResponseEntity<Object> deleteBorrower(@RequestParam(value = "id") int borrowerID) {
        if(db.deleteBorrower(borrowerID)){
            return ResponseEntity.status(HttpStatus.OK).body("Deleted borrower");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to delete borrower");
    }

    // issue a book
    @PostMapping("/issue")
    public ResponseEntity<Object> IssueBook(@RequestBody Map<String, Integer> json) {
        String error = db.IssueBook(json.get("BookID"), json.get("BorrowerID"));
        if (error == "OK")
            return ResponseEntity.ok(error);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // return a book
    @PostMapping("/return")
    public ResponseEntity<Object> ReturnBook(@RequestBody Map<String, Integer> json) {
        String error = db.ReturnBook(json.get("BookID"), json.get("BorrowerID"), json.get("IsDamagedOrLost"));
        if (error == "OK")
            return ResponseEntity.ok(error);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // get a page of borrowers
    @GetMapping(path = "/borrowers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getBorrowerPage(@RequestParam(value = "page") int pageNo) {
        String borrowers = db.getBorrowerPage(pageNo);
        if (borrowers != null)
            return ResponseEntity.ok(borrowers);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No more borrowers to display");
    }

    // get borrower details by borrowerID
    @GetMapping(path = "/borrower", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getDefaulterDetails(@RequestParam(value = "id") int BorrowerID) {
        String borrowers = db.getBorrowerDetails(BorrowerID);
        if (borrowers != null)
            return ResponseEntity.ok(borrowers);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not get borrower details");
    }
    
    // search borrowers by name
    @GetMapping(path = "/searchBorrowers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> searchBorrowers(@RequestParam(value = "query") String searchQuery) {
        if(searchQuery.length() < 3){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter atleast 3 characters");
        }
        List<ObjectNode> borrowers = db.searchBorrowers(searchQuery);
        if (borrowers != null)
            return ResponseEntity.ok(borrowers);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Search returned no results");
    }

    // mark a copy as damaged by the library
    @PostMapping("/markDamage")
    public ResponseEntity<Object> markDamagedCopy(@RequestParam(value = "bookID") int BookID) {
        String error = db.markCopyAsDamaged(BookID);
        if (error == "OK")
            return ResponseEntity.ok(error);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // get a page of 10 defaulters each
    @GetMapping(path = "/defaulters", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getDefaulterPage(@RequestParam(value = "page") int pageNo) {
        String borrowers = db.getDefaulterPage(pageNo);
        if (borrowers != null)
            return ResponseEntity.ok(borrowers);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No more defaulters to display");
    }

    // get stats for dashboard
    @GetMapping(path = "/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getDashboardStats() {
        String borrowers = db.getDashboardStats();
        if (borrowers != null)
            return ResponseEntity.ok(borrowers);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error while computing stats for dashboard");
    }
    
    // Delete a Book
    @PostMapping("/deleteBook")
    public ResponseEntity<Object> DeleteBook(@RequestBody Map<String, Integer> json) {
        String error = Database.DeleteBook(json.get("BookID"), json.get("isBorrowed"));
        if (error == "OK")
            return ResponseEntity.ok(error);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
	}
    
}
