package com.group_b.silverfish;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Borrower {
    int BorrowerID;
    String FirstName;
    String LastName;
    long DateOfBirth;
    String ContactPhone;
    String ContactEmail;
    char BorrowerType;

    public int getBorrowerID() {
        return BorrowerID;
    }

    public String getFirstName() {
        return FirstName;
    }

    public String getLastName() {
        return LastName;
    }

    public long getDateOfBirth() {
        return DateOfBirth;
    }

    public String getContactPhone() {
        return ContactPhone;
    }

    public String getContactEmail() {
        return ContactEmail;
    }

    public char getBorrowerType() {
        return BorrowerType;
    }

    Borrower(@JsonProperty("BorrowerID") int borrowerID,
            @JsonProperty("FirstName") String firstName,
            @JsonProperty("LastName") String lastName,
            @JsonProperty("DateOfBirth") long dateofBirth,
            @JsonProperty("ContactPhone") String contactPhone,
            @JsonProperty("ContactEmail") String contactEmail,
            @JsonProperty("BorrowerType") char borrowerType) {
        BorrowerID = borrowerID;
        FirstName = firstName;
        LastName = lastName;
        DateOfBirth = dateofBirth;
        ContactPhone = contactPhone;
        ContactEmail = contactEmail;
        BorrowerType = borrowerType;
    }

    Borrower(String firstName, String lastName, long dateofBirth, String contactPhone, String contactEmail, char borrowerType) {
        this(-1, firstName, lastName, dateofBirth, contactPhone, contactEmail, borrowerType);
    }
    
}
