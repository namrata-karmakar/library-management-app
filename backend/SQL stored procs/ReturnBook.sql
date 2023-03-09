SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[ReturnBook] @bookID INT, @borrowerID INT, @isDamagedOrLost INT
AS
    --INPUTS
    -- DECLARE @bookID INT = 1
    -- DECLARE @borrowerID INT = 1
    -- DECLARE @isDamagedOrLost INT = 0
    
    SET NOCOUNT ON

    --Check if borrower has borrowed said book and has not returned it as of now
    DECLARE @returnIssueID INT
    DECLARE @returnTime INT

    SELECT @returnIssueID = I.IssueID FROM IssueHistory I  
                    INNER JOIN CopyInfo C ON I.CopyID = C.CopyID
                    WHERE I.BorrowerID = @borrowerID AND C.BookID = @bookID AND C.IsBorrowed = 1
    IF (@returnIssueID IS NULL)        
        THROW 50020, 'Borrower has not borrowed this book. Check inputs', 1;
    
    SELECT @returnTime = DATEDIFF(s, '1970-01-01', GETUTCDATE())

    IF (@isDamagedOrLost = 1)
        SET @isDamagedOrLost = @borrowerID
    ELSE
        SET @isDamagedOrLost = NULL
    BEGIN TRAN
        UPDATE IssueHistory SET DateOfReturn = @returnTime WHERE IssueID = @returnIssueID
        UPDATE C
            SET C.IsBorrowed = 0, C.DamagedOrLostBy = @isDamagedOrLost
            FROM CopyInfo AS C
                INNER JOIN IssueHistory AS I
                ON C.CopyID = I.CopyID
                    WHERE I.IssueID = @returnIssueID; 
    COMMIT TRAN
    SELECT @returnTime

GO