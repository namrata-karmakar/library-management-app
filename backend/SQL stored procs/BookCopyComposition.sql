--/****** Object:  StoredProcedure [dbo].[GetIssueHistory]    Script Date: 15-12-2022 05:47:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[BookCopyComposition]
AS
	SET NOCOUNT ON
	IF OBJECT_ID('tempdb..#CopyCounts') IS NOT NULL DROP TABLE #CopyCounts
		CREATE TABLE #CopyCounts (BookID INT, CopyCount INT)

	INSERT INTO #CopyCounts
		SELECT BookID, COUNT(BookID) 
			FROM CopyInfo
				WHERE DamagedOrLostBy IS NULL
				GROUP BY BookID

	SELECT
		'$CHART' =
			(SELECT B.Title, ISNULL(CC.CopyCount, 0) AS 'Count'
				FROM Book B
				LEFT JOIN #CopyCounts CC ON CC.BookID = B.BookID
			FOR JSON PATH),
		'$TABLE' = 
			(SELECT B.Title AS 'Book Title', A.FirstName+' '+A.LastName AS 'Author', ISNULL(CC.CopyCount, 0) AS 'Existing Copies',
				(SELECT COUNT(1) FROM CopyInfo WHERE BookID = CC.BookID AND DamagedOrLostBy IS NOT NULL) AS 'Damaged Copies',
				ROW_NUMBER() OVER (Order by CC.CopyCount DESC) AS RowNumber
				FROM BOOK B
				LEFT JOIN #CopyCounts CC ON CC.BookID = B.BookID
				LEFT JOIN Author A ON B.AuthorID = A.AuthorID
			FOR JSON PATH)
		FOR JSON PATH

GO