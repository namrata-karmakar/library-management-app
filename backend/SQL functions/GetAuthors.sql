CREATE FUNCTION GetAuthors (@BookID INT)
  RETURNS NVARCHAR(MAX)
  AS
  BEGIN
    DECLARE @retJSON NVARCHAR(MAX) = (
        SELECT * FROM(
            SELECT FirstName+' '+LastName AS 'AuthorName', A.AuthorID AS 'AuthorID' FROM Author A
                INNER JOIN Book B ON A.AuthorID = B.AuthorID
                WHERE B.BookID = @bookID
            UNION
            SELECT A.FirstName+' '+A.LastName, A.AuthorID FROM CoAuthor C
                INNER JOIN Author A ON A.AuthorID = C.AuthorID
                WHERE C.BookID = @bookID
        ) X 
        FOR JSON PATH
    )
    RETURN @retJSON
  END
GO