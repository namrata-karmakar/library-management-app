SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[MarkCopyAsDamaged] @damagedBookID INT
AS
    SET NOCOUNT ON

    -- mark a copy of a book as damaged
    -- this is used in the case where a borrower is not responsible for the damage
    -- the library itself chooses to replace a copy of the book (possibly because it has worn out/damaged while in the library)
    
    IF NOT EXISTS (SELECT TOP 1 1 FROM CopyInfo WHERE BookID = @damagedBookID AND DamagedOrLostBy IS NULL AND IsBorrowed = 0)
        THROW 50010, 'No copy for the selected book in the library can be marked as damaged', 1;

    UPDATE CopyInfo SET DamagedOrLostBy = -1 
        WHERE BookID = @damagedBookID AND DamagedOrLostBy IS NULL AND IsBorrowed = 0
GO
