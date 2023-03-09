SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[GetDashboardStats]
AS
    SET NOCOUNT ON
    DECLARE @finePerDay INT = 1
    DECLARE @daySeconds INT = (SELECT 24*60*60)
    DECLARE @now INT = DATEDIFF(s, '1970-01-01', GETUTCDATE())

    SELECT 
        -- number of books that are borrowed at the moment 
        Borrowed = (SELECT COUNT(1) AS 'Count' FROM CopyInfo WHERE IsBorrowed = 1),

        -- number of books that are overdue at the moment 
        Overdue  = (SELECT COUNT(1) AS 'Count' FROM IssueHistory 
                    WHERE DateOfReturn IS NULL
                        AND DATEDIFF(s, '1970-01-01', GETUTCDATE()) > DateOfIssue + DurationOfLoan*(24*60*60)
                    ),
        -- number of books with no physical copies
        NoPhysicalCopy = (SELECT COUNT(DISTINCT BookID) FROM Book 
                            WHERE BookID NOT IN 
                                (    
                                SELECT BookID FROM CopyInfo 
                                    WHERE DamagedOrLostBy IS NULL
                                )
                        ),

        -- get total fine incured by all defaulters
        TotalFine = (SELECT SUM(@finePerDay*(@now - (DateOfIssue + DurationOfLoan*@daySeconds))/@daySeconds) 
                        FROM IssueHistory
                        WHERE DateOfReturn IS NULL
                            AND DATEDIFF(s, '1970-01-01', GETUTCDATE()) > DateOfIssue + DurationOfLoan*(24*60*60)
                    )                
    FOR JSON PATH


GO