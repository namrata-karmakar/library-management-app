package com.group_b.silverfish;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Book {
    int BookID;
    String Title;
    List<Integer> AuthorIDs;
    long Year;
    String CoverURL;
    int RestrictionID;
    long ISBN;

    public int getBookID() {
        return BookID;
    }
    public String getTitle() {
        return Title;
    }
    public List<Integer> getAuthorIDs() {
        return AuthorIDs;
    }
    public long getYear() {
        return Year;
    }
    public String getCoverURL() {
        return CoverURL;
    }
    public int getRestrictionID() {
        return RestrictionID;
    }
    public long getISBN() {
        return ISBN;
    }

    Book(@JsonProperty("BookID") int bookID,
            @JsonProperty("Title") String title,
            @JsonProperty("AuthorIDs") List<Integer> authorID,
            @JsonProperty("Year") long year,
            @JsonProperty("CoverURL") String coverURL,
            @JsonProperty("RestrictionsID") int restrictionsID,
            @JsonProperty("ISBN") Long isbn){
        BookID = bookID;
        Title = title;
        AuthorIDs = authorID;
        Year = year;
        CoverURL = coverURL;
        RestrictionID = restrictionsID;
        ISBN = isbn;
    }

    Book(String title, List<Integer> authorID, long year, String coverURL, int restrictionsID, Long isbn){
        this (-1, title, authorID, year, coverURL, restrictionsID, isbn);
    }

}
