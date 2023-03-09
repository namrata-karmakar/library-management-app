package com.group_b.silverfish;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Author {
    int AuthorID;
    String FirstName;
    String LastName;
    String Country;
    String ImageURL;

    public int getAuthorID() {
        return AuthorID;
    }
    public String getFirstName() {
        return FirstName;
    }
    public String getLastName() {
        return LastName;
    }
    public String getCountry() {
        return Country;
    }
    public String getImageURL() {
        return ImageURL;
    }

    Author(@JsonProperty("AuthorID") int authorID, 
            @JsonProperty("FirstName") String firstName,
            @JsonProperty("LastName") String lastName,
            @JsonProperty("Country") String country,
            @JsonProperty("ImageURL") String imageURL){
        AuthorID = authorID;
        FirstName = firstName;
        LastName = lastName;
        Country = country;
        ImageURL = imageURL;
    }

    Author (String firstName, String lastName, String country, String imageURL){
        this(-1, firstName, lastName, country, imageURL);
    }

    Author (String firstName, String lastName, String country){
        this(-1, firstName, lastName, country, null);
    }
    
}
