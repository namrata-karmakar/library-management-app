SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[GetAuthorPage] @pageNumber INT, @pageSize INT = 10, @authorID INT = 0, @searchQuery NVARCHAR(255) = '%'
AS
    SET NOCOUNT ON
    --INPUTS
    -- DECLARE @pageNumber INT = 0
    -- DECLARE @pageSize INT = 10
    -- DECLARE @authorID INT = 4
    -- DECLARE @searchQuery NVARCHAR(255) = 'C%'

    IF (@authorID <> 0 )
        BEGIN
            SET @pageSize = 1
            SET @pageNumber = 0
            SET @searchQuery = ''
        END
    ELSE
        BEGIN
            SET @searchQuery = '%' + @searchQuery + '%'
        END

    
    SELECT A.AuthorID, A.FirstName, A.LastName, A.Country, A.ImageURL, RowNum FROM (
        SELECT ROW_NUMBER() OVER(ORDER BY (SELECT NULL as noorder)) AS RowNum, 
        AuthorID, FirstName, LastName, Country, ImageURL
            FROM Author
			WHERE   (AuthorID  = @authorID AND @authorID <> 0)
                    OR  (@authorID = 0 AND (FirstName LIKE @searchQuery) OR (LastName LIKE @searchQuery))
		)
    AS A
		WHERE RowNum BETWEEN (@pageNumber*@pageSize + 1) AND (@pageNumber*@pageSize + @pageSize)
        

GO