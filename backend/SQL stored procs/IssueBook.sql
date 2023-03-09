SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[IssueBook] @bookID INT, @borrowerID INT
AS
    SET NOCOUNT ON

    --INPUTS
    -- DECLARE @bookID INT = 6
    -- DECLARE @borrowerID INT = 11

    DECLARE @StudentLoanDays INT = 5
    DECLARE @FacultyLoanDays INT = 10
    DECLARE @StudentLoanBooks INT = 2
    DECLARE @FacultyLoanBooks INT = 4
        
    DECLARE @copyID INT
    DECLARE @durationOfLoan INT 
    DECLARE @maxBooks INT 
    DECLARE @now INT
    DECLARE @MaxLoanDays INT
    DECLARE @MinAge INT
    DECLARE @AvailabilityEndDate BIGINT
    DECLARE @BorrowerAge INT
    
    --Input correctness checks
    IF NOT EXISTS (SELECT TOP 1 1 FROM Borrower WHERE BorrowerID = @borrowerID)
        THROW 50010, 'Invalid Borrower ID', 1;

    IF NOT EXISTS (SELECT TOP 1 1 FROM Book WHERE BookID = @bookID)
        THROW 50011, 'Invalid Book ID', 1;

    --Check if there are is atleast one copy of the book
    IF NOT EXISTS (SELECT TOP 1 1 FROM CopyInfo WHERE BookID = @bookID AND IsBorrowed = 0 AND DamagedOrLostBy IS NULL)
        THROW 50012, 'No copy of the book is currently available', 1; 

    SELECT TOP 1 @copyID = CopyID FROM CopyInfo WHERE BookID = @bookID AND IsBorrowed = 0 AND DamagedOrLostBy IS NULL

    --Check if borrower is has currently defaulted issues
    SELECT @now = DATEDIFF(s, '1970-01-01', GETUTCDATE())
    IF (@borrowerID IN (SELECT BorrowerID FROM CopyInfo C
                            INNER JOIN IssueHistory I ON C.CopyID = I.CopyID
                            WHERE I.DateOfReturn IS NULL 
                                AND @now > (I.DateOfIssue + DurationOfLoan*24*60*60)
                                AND I.BorrowerID = @borrowerID))
        THROW 50013, 'Borrower is already late in returning book', 1; 
    
    --Check if this borrower has borrowed a different copy of the same book
    IF (1 = (SELECT 1 FROM IssueHistory I
            INNER JOIN CopyInfo C ON I.CopyID = C.CopyID
            WHERE BorrowerID = @borrowerID AND BookID = @bookID AND I.DateOfReturn IS NULL))
        THROW 50014, 'Borrower has already borrowed another copy of the same book', 1;


    SELECT  @durationOfLoan = CASE WHEN BorrowerType = 'S' THEN @StudentLoanDays ELSE @FacultyLoanDays END,
            @maxBooks = CASE WHEN BorrowerType = 'S' THEN @StudentLoanBooks ELSE @FacultyLoanBooks END 
        FROM Borrower WHERE BorrowerID = @borrowerID

    --Check if this borrower has borrowed the maximum allowed number of books at the moment
    IF (@maxBooks = (SELECT COUNT(*) FROM IssueHistory WHERE DateOfReturn IS NULL AND BorrowerID = @borrowerID))
        THROW 50015, 'Borrower has already borrowed the maximum allowed number of books', 1;

    SELECT @MaxLoanDays = R.MaxLoanDays, @MinAge = r.MinAge, @AvailabilityEndDate = AvailabilityEndDate FROM Book B 
                                INNER JOIN Restrictions R ON B.RestrictionsID = R.RestrictionID
                                WHERE B.BookID = @bookID
    IF (@durationOfLoan < ISNULL(@MaxLoanDays,999999))
        BEGIN
        SELECT @BorrowerAge = DATEDIFF(yy,DATEADD(S, DateOfBirth, '1970-01-01'),GETUTCDATE()) From Borrower WHERE BorrowerID = @borrowerID
        IF(@BorrowerAge >= ISNULL(@MinAge, 0))
            BEGIN
            IF (ISNULL(@AvailabilityEndDate, 9000000000) > (@now + @durationOfLoan*24*60*60))
                BEGIN
                BEGIN TRAN
                    INSERT INTO IssueHistory OUTPUT INSERTED.IssueID VALUES (@copyID, @borrowerID, DATEDIFF(s, '1970-01-01', GETUTCDATE()), @durationOfLoan, NULL)
                    UPDATE CopyInfo SET IsBorrowed = 1 WHERE CopyID = @copyID
                COMMIT TRAN
                END
            ELSE
                BEGIN
                ;THROW 50016, 'The book cannot cannot be loaned as it has to be returned sooner. Set a smaller loan duration', 1;    
                END
            END
        ELSE
            BEGIN
            ;THROW 50017, 'The book cannot be loaned as the borrower is underage', 1; 
            END    
        END 
    ELSE
        BEGIN
        ;THROW 50018, 'The book cannot be loaned for the requested time period', 1; 
        END
GO
