USE [host-zero]
GO

/****** Object:  StoredProcedure [dbo].[GenerateReport]    Script Date: 15-12-2022 04:56:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER   PROCEDURE [dbo].[GenerateReport] @reportID INT, @paramsXML XML
AS
    SET NOCOUNT ON
	--GenerateReport SP
	/*
	{Endpoint}/generateReport?reportid=1&param1Name=age&param1Value=76
	Java layer will parse this request
	Convert the params to xml
	<params age="60" test="hello" />
	*/
	--INPUTS
	--DECLARE @reportID INT = 1
	--DECLARE @paramsXML XML = '<params age="60"/>'


	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'DECLARE @reportID INT = '+CONVERT(NVARCHAR(255), @reportID)+'; '
	SELECT @SQL = @SQL + 'DECLARE @paramsXML XML = '''+CONVERT(NVARCHAR(255), @paramsXML)+'''; '

	SELECT @SQL = @SQL +
	'DECLARE @'+ParamName+' '
		+CASE WHEN ParamType = 1 THEN 'NVARCHAR(MAX)' 
			ELSE  'INT' END
		+' = (SELECT Tbl.Col.value(''@'+ParamName+''', '''
		+CASE WHEN ParamType = 1 THEN 'NVARCHAR(MAX)' 
			ELSE  'INT' END
		+''') FROM @paramsXML.nodes(''//params'') Tbl(Col));	'
	FROM ReportParam WHERE ReportId = @reportID

	SELECT @SQL = @SQL + 'EXEC '+ ReportSP+ ' '
		FROM Report
		WHERE ReportId = @reportID

	SELECT @SQL = @SQL +'@'+ParamName+' = @'+ParamName+', ' FROM ReportParam WHERE ReportID = @reportID
	IF EXISTS (SELECT 1 FROM ReportParam WHERE ReportID = @reportID)
		SELECT @SQL = SUBSTRING(@SQL, 1, (LEN(@SQL) - 1))

	EXEC (@SQL)
GO


