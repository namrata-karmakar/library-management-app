THROW 55555, 'You sure you want to do that?', 1; 
--snippet to drop all tables
--use with caution
-- IF OBJECT_ID('GenreAuthorMapping', 'U') IS NOT NULL 
--     DROP TABLE GenreAuthorMapping
-- IF OBJECT_ID('Genre', 'U') IS NOT NULL 
--     DROP TABLE Genre
-- IF OBJECT_ID('IssueHistory', 'U') IS NOT NULL 
--     DROP TABLE IssueHistory
-- IF OBJECT_ID('CopyInfo', 'U') IS NOT NULL 
--     DROP TABLE CopyInfo
-- IF OBJECT_ID('Borrower', 'U') IS NOT NULL 
--     DROP TABLE Borrower
-- IF OBJECT_ID('Book', 'U') IS NOT NULL 
--     DROP TABLE Book
-- IF OBJECT_ID('Restrictions', 'U') IS NOT NULL 
--     DROP TABLE Restrictions
-- IF OBJECT_ID('Author', 'U') IS NOT NULL 
--     DROP TABLE Author

CREATE TABLE Author (
                    AuthorID INT IDENTITY NOT NULL,
                    FirstName NVARCHAR(255) NOT NULL,
                    LastName NVARCHAR(255) NOT NULL,
                    Country NVARCHAR(255), --let frontend control the values given to this field. Reduces complexity. Lock this down using entry control.
                    ImageURL NVARCHAR(1023),
                    PRIMARY KEY(AuthorID)) 

/* imageurl should be nullable, so if we keep imageurl as unique, there can be only one row with ImageUrl value as NULL.
If we add fn,ln and country unique contraint, we may run into an issue as it is possible to have more than one author with the same name from the 
same country.
If we add fn,ln and url unique constraint, it will casue issue as the length of the index will be too large, and url can be a large string*/

CREATE TABLE Restrictions (
                    RestrictionID INT IDENTITY NOT NULL,
                    MaxLoanDays INT,
                    MinAge BIGINT,
                    AvailabilityEndDate BIGINT,
                    PRIMARY KEY(RestrictionID),
                    CONSTRAINT mld_dob_aed UNIQUE (MaxLoanDays, MinAge, AvailabilityEndDate)
)

-- Give the option in frontend to use some commonly used restrictions so the id may be reused
-- frontend should have a page to view and manage some default restrictions. These can be later saved into its own table.

CREATE TABLE Book (
                    BookID INT IDENTITY NOT NULL,
                    Title NVARCHAR(255) NOT NULL,
                    AuthorID INT,
                    Year BIGINT,
                    CoverURL NVARCHAR(1023),
                    RestrictionsID INT,
                    ISBN BIGINT,
                    PRIMARY KEY(BookID),
                    CONSTRAINT isbn_unique UNIQUE (ISBN),
                    CONSTRAINT fk_author FOREIGN KEY(AuthorID) REFERENCES Author(AuthorID),
                    CONSTRAINT fk_restriction FOREIGN KEY(RestrictionsID) REFERENCES Restrictions(RestrictionID)
)

CREATE TABLE CoAuthor(
                    BookID INT,
                    AuthorID INT,
                    CONSTRAINT fk_coauthor FOREIGN KEY(AuthorID) REFERENCES Author(AuthorID),
                    CONSTRAINT fk_coauthor_book FOREIGN KEY(BookID) REFERENCES Book(BookID)
)

CREATE TABLE Borrower (
                    BorrowerID INT IDENTITY NOT NULL,
                    FirstName NVARCHAR(255) NOT NULL,
                    LastName NVARCHAR(255) NOT NULL,
                    DateOfBirth BIGINT,
                    ContactPhone NVARCHAR(20),
                    ContactEmail NVARCHAR(255),
                    BorrowerType CHAR DEFAULT 'S',
                    PRIMARY KEY(BorrowerID),
                    CONSTRAINT fn_ln_dob UNIQUE (FirstName, LastName, DateOfBirth),
                    CONSTRAINT type_check CHECK (BorrowerType in ('S','F'))
)

CREATE TABLE CopyInfo ( 
                                    CopyID INT IDENTITY NOT NULL,
                                    BookID INT NOT NULL, 
                                    IsBorrowed BIT DEFAULT 0,
                                        /*This will improve performance, instead of computing each time using inner joins on IssueHistory
                                         Also, we can quickly check if a specific book is available ATM*/
                                    DamagedOrLostBy INT, -- stores the BorrowerID if the copy was damaged/lost by a user, -1 if library itslef needs to mark the copy to be replaced
                                    PRIMARY KEY(CopyID),
                                    CONSTRAINT fk_book FOREIGN KEY(BookID) REFERENCES Book(BookID)
)

CREATE TABLE IssueHistory (
                            IssueID INT IDENTITY NOT NULL,
                            CopyID INT NOT NULL,
                            BorrowerID INT NOT NULL,
                            DateOfIssue BIGINT NOT NULL,
                            DurationOfLoan INT NOT NULL,
                            DateOfReturn BIGINT,
                            PRIMARY KEY(IssueID),
                            CONSTRAINT fk_copy FOREIGN KEY(CopyID) REFERENCES CopyInfo(CopyID),
                            CONSTRAINT fk_borrower FOREIGN KEY(BorrowerID) REFERENCES Borrower(BorrowerID)
)

CREATE TABLE Genre (
                    GenreID INT,
                    Name NVARCHAR(255),
                    PRIMARY KEY(GenreID)
)

CREATE TABLE GenreAuthorMapping(
                    GenreID INT IDENTITY NOT NULL,
                    AuthorID INT,
                    CONSTRAINT fk_genre FOREIGN KEY (GenreID) REFERENCES Genre(GenreID),
                    CONSTRAINT fk_authorid FOREIGN KEY (AuthorID) REFERENCES Author(AuthorID)
)


create table Report(
	ReportID INT IDENTITY,
	ReportName NVARCHAR(255) NOT NULL,
	ReportSP NVARCHAR(255) NOT NULL,
	ReportType INT DEFAULT 1, --1 Table, 2 Chart and Table
	PRIMARY KEY(ReportID)
)

create table ReportParam(
	ParamID INT IDENTITY,
	ParamName NVARCHAR(255) NOT NULL,
	ParamType INT DEFAULT 2, --1 String, 2 Int, 3 Boolean
	ReportID INT,
    ParamHint NVARCHAR(255),
    ParamDefault NVARCHAR(255)
	PRIMARY KEY(ParamID),
	CONSTRAINT fk_report FOREIGN KEY(ReportID) REFERENCES Report(ReportID),
	CONSTRAINT param_type_check CHECK (ParamType in (1,2,3))
)
---------------

-- 1) Insert a Book
    --1.1) Create Author if they do not exist
    -- use OUTPUT clause to propagate auto-generated author ID to caller. this can be captured in a ResultSet in our springboot api code. 
    INSERT INTO Author OUTPUT INSERTED.AuthorID VALUES ('Stephen', 'King', 'USA', 'https://en.wikipedia.org/wiki/File:Stephen_King,_Comicon.jpg')
    -- Create restrictions if needed
    INSERT INTO Restrictions(MaxLoanDays) OUTPUT INSERTED.RestrictionID VALUES (20)
    INSERT INTO Book OUTPUT INSERTED.BookID VALUES ('The Shining', 1, 1977, 'https://upload.wikimedia.org/wikipedia/en/4/4c/Shiningnovel.jpg', 1, 1234567890123)

SELECT * FROM Author
SELECT * FROM Restrictions
SELECT * FROM Book

-- 2) Insert 5 copies of a book
    --this has to go in a single transcation as mssql will process every statement in the bacth x times.
    GO
    INSERT INTO CopyInfo VALUES (3, 0)
    GO 2

SELECT * FROM CopyInfo

-- 3) Insert a borrower
    INSERT INTO Borrower OUTPUT INSERTED.BorrowerID VALUES ('Jane', 'Doe', 852073200, NULL, NULL, 'S')

SELECT * FROM Borrower


-- 4) Issue a book
    -- package this as an SP
    -- check constraints "IN SQL"
    -- there will be a computational load on the db even if we try to check the same contraints at frontend before inserting
    -- so we will communicate the error condition, if any, through error codes and verbose error messages
    -- this way, delays caused by network calls can be eliminated
    
    --INPUTS
        DECLARE @bookID INT = 7
        DECLARE @borrowerID INT = 7
    -----------------------
    -----------------------
    EXEC IssueBook @bookID, @borrowerID

SELECT* FROM IssueHistory WHERE DateOfReturn is null ORDER BY IssueID DESC
SELECT * FROM CopyInfo    where IsBorrowed =1


-- 5) View a defaulter
    -- Consider only those books that are loaned at the moment
    -- Compute expected return day and see if its earlier than NOW
    -- compute fines in this statement - keep a fixed value for fines per day defaulted
    
    --declared above
    DECLARE @now INT = DATEDIFF(s, '1970-01-01', GETUTCDATE())
    DECLARE @finePerDay INT = 1
    DECLARE @daySeconds INT = (SELECT 24*60*60)
    SELECT 
        I.BorrowerID, B.FirstName, B.LastName, B.DateOfBirth, B.ContactPhone, B.ContactEmail, K.BookID, K.Title, C.CopyID, (@now - (I.DateOfIssue + DurationOfLoan*@daySeconds))/@daySeconds*@finePerDay AS [FineIncurred]  
    FROM CopyInfo C
        INNER JOIN IssueHistory I ON C.CopyID = I.CopyID
        INNER JOIN Borrower B ON B.BorrowerID = I.BorrowerID 
        INNER JOIN Book K ON K.BookID = C.BookID 
    WHERE I.BorrowerID = 6 AND IsBorrowed = 1 AND @now > (I.DateOfIssue + DurationOfLoan*@daySeconds);

-- 6) Delete a copy
    -- A copy that was borrowed was damaged (WHERE isBorrowed=1)
    -- A copy that was in the library was damaged (WHERE isBorrowed=0)
    
-- 7) Return a book
    DECLARE @returnBookID INT = 1
    DECLARE @returnBorrowerID INT = 1
    EXEC ReturnBook @returnBookID, @returnBorrowerID


SELECT * FROM Author
SELECT * FROM Restrictions
SELECT * FROM Book
SELECT * FROM CopyInfo
SELECT * FROM Borrower
SELECT * FROM IssueHistory

--1 page of books details - full row(except restriction [not needed?]) + author name + available copies
EXEC GetBookPage 0 --page number starts with 0

--2 page of author details - full row
EXEC GetAuthorPage 0 --page number starts with 0

--3 page of borrower - full row + isCurrentlyDefaulting + booksInPossession
EXEC GetBorrowerPage 0

--Mark a book for replacememt by the library
EXEC MarkCopyAsDamaged 1

SELECT dbo.GetAuthors(14)