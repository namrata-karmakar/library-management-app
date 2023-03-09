SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[GetBorrowerPage] @pageNumber INT, @pageSize INT = 10, @defaultersOnly INT = 0, @borrowerID INT = 0
AS
    SET NOCOUNT ON
    
    --INPUTS
    -- DECLARE @pageNumber INT = 0
    -- DECLARE @pageSize INT = 10
    -- DECLARE @defaultersOnly INT = 0
    -- DECLARE @borrowerID INT = 0

    --If a BorrowerID is specified, output details and fines for each of the book that is currently borrowed by the borrower
        -- in this case, page number and page size are not considered
    
    --If BorrowerID is not specified, output total fine for each borrower
        -- If @defaultersOnly is set to 1 then display only defaulters

    DECLARE @now INT = DATEDIFF(s, '1970-01-01', GETUTCDATE())
    DECLARE @daySeconds INT = (SELECT 24*60*60)
    DECLARE @finePerDay INT = 1
    
    IF OBJECT_ID('tempdb..#Defaulters') IS NOT NULL DROP TABLE #Defaulters
    CREATE TABLE #Defaulters (ID INT IDENTITY, BorrowerID INT, CopyID INT, Fine INT)

    IF (@borrowerID <> 0) AND NOT EXISTS (SELECT TOP 1 1 FROM Borrower WHERE BorrowerID = @borrowerID)
        THROW 50010, 'Invalid Borrower ID', 1;

    INSERT INTO #Defaulters
    SELECT BorrowerID, CopyID, (@now - (DateOfIssue + DurationOfLoan*@daySeconds))/@daySeconds*@finePerDay 
        FROM IssueHistory
        WHERE   (@now - (DateOfIssue + DurationOfLoan*@daySeconds)) > 0 --It is past the return time for the borrowed book 
                AND --if a @borrowerID is provided, select only that borrower details
                (   (DateOfReturn IS  NULL AND BorrowerID = @borrowerID AND @borrowerID <> 0)
                OR  (DateOfReturn IS  NULL AND  @borrowerID = 0))

    IF (@borrowerID = 0)
    BEGIN
        --merge and add fines
        MERGE #Defaulters tgt
        USING (SELECT MAX(ID) AS ID, BorrowerID,  SUM(Fine) AS Fine
            FROM #Defaulters
            GROUP BY BorrowerID) src ON tgt.ID = src.ID
        WHEN MATCHED THEN
            UPDATE
            SET Fine = src.Fine
        WHEN NOT MATCHED BY SOURCE THEN
            DELETE;

        SELECT X.BorrowerID, X.FirstName, X.LastName, X.DateOfBirth, X.ContactPhone, X.ContactEmail, X.BorrowerType, X.FineIncurred FROM (
            SELECT ROW_NUMBER() OVER(ORDER BY D.Fine DESC) AS RowNum,
                B.BorrowerID, B.FirstName, B.LastName, B.DateOfBirth, B.ContactPhone, B.ContactEmail, B.BorrowerType, ISNULL(D.Fine, 0) AS FineIncurred
                    FROM Borrower B 
                LEFT JOIN #Defaulters D ON B.BorrowerID = D.BorrowerID
                WHERE (ISNULL(D.Fine, 0) > 0 AND @defaultersOnly <>0)
                    OR(@defaultersOnly = 0))
        AS X
            WHERE RowNum BETWEEN (@pageNumber*@pageSize + 1) AND (@pageNumber*@pageSize + @pageSize)
            FOR JSON PATH
    END
    ELSE
    BEGIN
        SELECT 
            -- borrower details
            Borrower = (SELECT BorrowerID, FirstName, LastName, DateOfBirth, ContactPhone, ContactEmail, BorrowerType
                            FROM Borrower WHERE BorrowerID = @borrowerID
                                FOR JSON PATH),
            -- borrowed book details
            Books = (SELECT B.BookID, B.Title, C.CopyID, I.DateOfIssue, I.DurationOfLoan, 
				ISNULL((SELECT Fine FROM #Defaulters WHERE CopyID = C.CopyID), 0) AS 'Fine'  
                        FROM Borrower BR
                            INNER JOIN IssueHistory I ON I.BorrowerID = BR.BorrowerID AND I.DateOfReturn IS NULL
                            INNER JOIN CopyInfo C ON I.CopyID = C.CopyID
                            INNER JOIN Book B ON B.BookID = C.BookID
                        WHERE BR.BorrowerID = @borrowerID 
                        FOR JSON PATH)
        FOR JSON PATH 
    END


GO