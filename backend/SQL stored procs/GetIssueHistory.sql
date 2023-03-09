/****** Object:  StoredProcedure [dbo].[GetIssueHistory]    Script Date: 15-12-2022 05:47:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[GetIssueHistory] @includeCompleted INT
AS
	SET NOCOUNT ON
	SELECT
		B.FirstName+' '+B.LastName AS 'Borrower Name'
		,BK.Title AS 'Book Title'
		,CASE WHEN B.BorrowerType = 'S' THEN 'Student' ELSE 'Faculty' END AS 'Type'
		,I.DateOfIssue AS 'Date Of Issue{DATE}'
		,ISNULL(CONVERT(NVARCHAR(50),I.DateOfReturn), 'NULL') AS 'Date Of Return{DATE}'
		, ROW_NUMBER() OVER (Order by I.DateOFReturn) AS RowNumber
		FROM IssueHistory I
		INNER JOIN Borrower B ON I.BorrowerID = B.BorrowerID
		INNER JOIN CopyInfo C ON C.CopyID = I.CopyID
		INNER JOIN Book BK ON BK.BookID = C.BookID
			WHERE (I.DateOfReturn IS NULL AND @includeCompleted=0) OR (@includeCompleted=1) 
		FOR JSON PATH
	GO