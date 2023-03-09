SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[GetBookPage] @pageNumber INT, @pageSize INT = 10, @bookID INT = 0, @searchQuery NVARCHAR(255) = '%'
AS
    SET NOCOUNT ON
    -- INPUTS
    -- DECLARE @pageNumber INT = 1
    -- DECLARE @pageSize INT = 10    
    -- DECLARE @bookID INT = 0
    -- DECLARE @searchQuery NVARCHAR(255) = '%'

    -- for lack of a better term, a "page" is an ordered list of details of n books
    -- useful when we need to make a scrolling feed of books in the library, ie, a paginated api

    -- when bookID is specified, return only that book details, ignore page number and size values

    IF (@bookID <> 0 )
        BEGIN
            SET @pageSize = 1
            SET @pageNumber = 0
            SET @searchQuery = ''
        END
    ELSE 
        BEGIN
            SET @searchQuery = '%' + @searchQuery + '%'
        END

    SELECT X.BookID, X.Title, X.Year, X.CoverURL, X.ISBN, X.RestrictionsID, dbo.GetAuthors(X.BookID) AS 'Authors', ISNULL(X.AvailableCopies,0) AS 'AvailableCopies' FROM (
        SELECT ROW_NUMBER() OVER(ORDER BY (SELECT NULL as noorder)) AS RowNum,
            B.BookID, B.Title, B.Year, B.CoverURL, B.ISBN, B.RestrictionsID,
            COUNT(CI.CopyID) - SUM(CI.IsBorrowed) - SUM(CASE WHEN CI.DamagedOrLostBy <> 0 THEN 1 ELSE 0 END) AS [AvailableCopies] 
            -- Total number of available copies = total copies - copies borroewed at the moment - damaged/lost copies 
            FROM Book B
                LEFT JOIN CopyInfo CI on B.BookID = CI.BookID
				LEFT JOIN Author A on A.AuthorID = B.AuthorID
                    WHERE   (B.BookID  = @bookID AND @bookID <> 0)
                    OR      (@bookID = 0 AND B.Title LIKE @searchQuery OR A.FirstName LIKE @searchQuery OR A.LastName LIKE @searchQuery)
                GROUP BY B.BookID, B.Title, B.Year, B.CoverURL, B.ISBN, B.RestrictionsID)
        AS X
            WHERE RowNum BETWEEN (@pageNumber*@pageSize + 1) AND (@pageNumber*@pageSize + @pageSize)
            
GO