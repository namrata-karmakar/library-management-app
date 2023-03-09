USE [host-zero]
GO

/****** Object:  StoredProcedure [dbo].[GetPopularBooks]    Script Date: 15-12-2022 04:45:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER   PROCEDURE [dbo].[GetPopularBooks] @TopN INT = 5
AS
    SET NOCOUNT ON
	SELECT DISTINCT TOP (@TopN) B.Title AS 'Book Title',
			COUNT(C.BookID) AS 'Number of times issued',
			ROW_NUMBER() OVER (Order by COUNT(C.BookID) DESC) AS RowNumber
			FROM IssueHistory I
			INNER JOIN CopyInfo C ON C.CopyID = I.CopyID
			INNER JOIN Book B ON C.BookID = B.BookID
		GROUP BY C.BookID, B.Title
		ORDER BY COUNT(C.BookID) DESC
		FOR JSON PATH
GO


