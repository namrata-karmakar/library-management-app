USE [host-zero]
GO

/****** Object:  StoredProcedure [dbo].[BookKillers]    Script Date: 15-12-2022 04:46:06 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER     PROCEDURE [dbo].[BookKillers]
AS
	SET NOCOUNT ON
	IF OBJECT_ID('tempdb..#Destroyers') IS NOT NULL DROP TABLE #Destroyers
	CREATE TABLE #Destroyers (BorrowerID INT, KillCount INT)

	INSERT INTO #Destroyers
		SELECT DamagedOrLostBy, COUNT(DamagedOrLostBy) FROM CopyInfo
			WHERE DamagedOrLostBy IS NOT NULL AND DamagedOrLostBy > 0
			GROUP BY DamagedOrLostBy

	SELECT B.FirstName+' '+B.LastName AS 'Name', D.KillCount AS 'Total Books Damaged',
		ROW_NUMBER() OVER (Order by D.KillCount DESC) AS RowNumber
		FROM #Destroyers D
		INNER JOIN Borrower B ON D.BorrowerID  = B.BorrowerID
		FOR JSON PATH
GO


