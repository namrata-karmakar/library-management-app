USE [host-zero]
GO

/****** Object:  StoredProcedure [dbo].[GetDefaultersOlderThanX]    Script Date: 15-12-2022 04:44:21 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER   PROCEDURE [dbo].[GetDefaultersOlderThanX] @age INT
AS
    SET NOCOUNT ON
	IF OBJECT_ID('tempdb..#Defaulters') IS NOT NULL DROP TABLE #Defaulters
	CREATE TABLE #Defaulters (Name NVARCHAR(510), Title NVARCHAR(255), Fine INT, Age INT)

	DECLARE @now INT = DATEDIFF(s, '1970-01-01', GETUTCDATE())
	DECLARE @daySeconds INT = (SELECT 24*60*60)
	DECLARE @finePerDay INT = 1

	INSERT INTO #Defaulters
	SELECT	B.FirstName + ' ' + B.LastName AS [Name], 
			BK.Title, 
			(@now - (DateOfIssue + DurationOfLoan*@daySeconds))/@daySeconds*@finePerDay,
			DATEDIFF(yy, DATEADD(s, B.DateOfBirth, '1970-01-01'), GETUTCDATE())
		FROM IssueHistory I
		INNER JOIN Borrower B ON I.BorrowerID = B.BorrowerID
		INNER JOIN CopyInfo C ON C.CopyID = I.CopyID
		INNER JOIN Book BK ON BK.BookID = C.BookID
		WHERE   (@now - (DateOfIssue + DurationOfLoan*@daySeconds)) > 0
				AND DateOfReturn IS  NULL

	SELECT Name, Age, Title AS 'Overdue Book Title', '€ ' + CONVERT(NVARCHAR(255), Fine) AS 'Fine Incurred' FROM #Defaulters WHERE Age > @age
	FOR JSON PATH
GO


