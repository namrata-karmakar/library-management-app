package com.group_b.silverfish;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class Database {
    private static final Logger LOGGER = Logger.getLogger(Database.class.getName());

    public Database() {
    }

    public static ResultSet ExecuteStatement(PreparedStatement ps) throws SQLException {
        try {
            ResultSet rs = ps.executeQuery();
            return rs;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return null;
        }
    }

    public int CreateNewAuthor(Author author) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn
                    .prepareStatement("INSERT INTO Author (FirstName, LastName, Country, ImageURL) OUTPUT INSERTED.AuthorID"
                                            + " VALUES (?, ?, ?, ?)");
            ps.setString(1, author.FirstName);
            ps.setString(2, author.LastName);
            ps.setString(3, author.Country);
            ps.setString(4, author.ImageURL);
            ResultSet rs = ps.executeQuery();
            rs.next();
            int AuthorID = Integer.parseInt(rs.getString(1));
            return AuthorID;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return -1;
        }
    }

    Author parseAuthorFromResultSet(ResultSet rs) throws SQLException {
        int AuthorID = rs.getInt("AuthorID");
        String FirstName = rs.getString("FirstName");
        String LastName = rs.getString("LastName");
        String Country = rs.getString("Country");
        String ImageURL = rs.getString("ImageURL");
        Author author = new Author(AuthorID, FirstName, LastName, Country, ImageURL);
        return author;
    }

    public Author getAuthorDetails(int AuthorID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT AuthorID, FirstName, LastName, Country, ImageURL FROM Author"
                                                                +" WHERE AuthorID = ?");
            ps.setInt(1, AuthorID);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No Author with given ID!");
                return null;
            }
            rs.next();
            Author author = parseAuthorFromResultSet(rs);
            return author;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return null;
        }
    }

    public boolean editAuthor(Author author) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn
                .prepareStatement("UPDATE Author SET FirstName = ?, LastName = ?, Country = ?, ImageURL = ? WHERE AuthorID = ?");
                ps.setString(1, author.FirstName);
                ps.setString(2, author.LastName);
                ps.setString(3, author.Country);
                ps.setString(4, author.ImageURL);
                ps.setInt(5, author.AuthorID);
            ps.execute();
            return true;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return false;
        }
    }

    public boolean deleteAuthor(int authorID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE FROM Author WHERE AuthorID = ?");
            ps.setInt(1, authorID);
            ps.execute();
            return true;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return false;
        }
    }

    public int CreateNewRestriction(Restriction restriction) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn
                    .prepareStatement("INSERT INTO Restrictions (MaxLoanDays, MinAge, AvailabilityEndDate)" 
                                            +" OUTPUT INSERTED.RestrictionID VALUES (?, ?, ?)");
            if (restriction.MaxLoanDays >= 0)
                ps.setInt(1, restriction.MaxLoanDays);
            else
                ps.setString(1, null);

            if (restriction.MinAge != 0)
                ps.setLong(2, restriction.MinAge);
            else
                ps.setString(2, null);

            if (restriction.AvailabilityEndDate != 0)
                ps.setLong(3, restriction.AvailabilityEndDate);
            else
                ps.setString(3, null);

            ResultSet rs = ps.executeQuery();
            rs.next();
            int RestrictionID = Integer.parseInt(rs.getString(1));
            return RestrictionID;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return -1;
        }
    }

    Restriction parseRestrictionFromResultSet(ResultSet rs) throws SQLException {
        int RestrictionID = rs.getInt("RestrictionID");
        int MaxLoanDays = rs.getInt("MaxLoanDays");
        int MinAge = rs.getInt("MinAge");
        long AvailabilityEndDate = rs.getLong("AvailabilityEndDate");
        Restriction restriction = new Restriction(RestrictionID, MaxLoanDays, MinAge, AvailabilityEndDate);
        return restriction;

    }

    public Restriction getRestrictionDetails(int RestrictionID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT RestrictionID, MaxLoanDays, MinAge, AvailabilityEndDate"
                                                            +" FROM Restrictions WHERE RestrictionID = ?");
            ps.setInt(1, RestrictionID);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No Restriction with given ID!");
                return null;
            }
            rs.next();
            Restriction restriction = parseRestrictionFromResultSet(rs);
            return restriction;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return null;
        }
    }

    public String viewAllRestrictions() {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT RestrictionID, "
                        +" ISNULL('Maximum Loan Days: '+CONVERT(NVARCHAR(50), MaxLoanDays), '')"
                        +" + ISNULL(', Age Limit: '+CONVERT(NVARCHAR(50), MinAge),'')"
                        +" + ISNULL(', Available Untill: '+CONVERT(NVARCHAR(50), DATEADD(S, AvailabilityEndDate, '1970-01-01')),'') AS 'Restriction'"
                        +" FROM Restrictions"
                        +" FOR JSON PATH");
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No response returned!");
                return null;
            }
            rs.next();
            String json_response = rs.getString(1);
            return json_response;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public int CreateNewBook(Book book) {
        try (Connection conn = DataSource.getConnection()) {
            if (book.AuthorIDs.size() < 1){
                LOGGER.severe("No author ID provided in list");
                return 0;
            }
            
            PreparedStatement ps = conn
                    .prepareStatement("INSERT INTO Book (Title, AuthorID, Year, CoverURL, RestrictionsID, ISBN)"
                                            +" OUTPUT INSERTED.BookID VALUES (?, ?, ?, ?, ?, ?)");
            ps.setString(1, book.Title);
            ps.setInt(2, book.AuthorIDs.get(0));
            ps.setLong(3, book.Year);
            ps.setString(4, book.CoverURL);
            ps.setInt(5, book.RestrictionID);
            ps.setLong(6, book.ISBN);
            ResultSet rs = ps.executeQuery();
            rs.next();
            int bookID = Integer.parseInt(rs.getString(1));
            //insert co-authors, if any, in CoAuthor table
            if (book.AuthorIDs.size() > 1){
                book.AuthorIDs.remove(0);
                String InsertCoAuthorsSQL = "";
                for (int i = 0; i<book.AuthorIDs.size(); i++){
                    InsertCoAuthorsSQL += "INSERT INTO CoAuthor (BookID, AuthorID) VALUES ("
                                            +Integer.toString(bookID)+", "+Integer.toString(book.AuthorIDs.get(i))+"); ";
                }
                ps = conn.prepareStatement(InsertCoAuthorsSQL);
                ps.execute();
            }
            
            return bookID;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return -1;
        }
    }

    public boolean editBook(Book book) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn
                .prepareStatement("UPDATE Book SET Title = ?, AuthorID = ?, Year = ?, CoverURL = ?, RestrictionsID = ?, ISBN = ? WHERE BookID = ?");
                ps.setString(1, book.Title);
                ps.setInt(2, book.AuthorIDs.get(0));
                ps.setLong(3, book.Year);
                ps.setString(4, book.CoverURL);
                ps.setInt(5, book.RestrictionID);
                ps.setLong(6, book.ISBN);
                ps.setLong(7, book.BookID);
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return false;
        }
    }

    public boolean insertCopies(int bookID, int copyCount){
        try (Connection conn = DataSource.getConnection()) {
            String ins_values = "(" + Integer.toString(bookID) + ")";
            if (copyCount>0){
                for (int i=1 ; i<copyCount ; i++){
                    ins_values += ", " + ins_values;
                }
            }
            String sql = "INSERT INTO CopyInfo (BookID) VALUES " + ins_values;
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.execute();
            return true;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return false;
        }
    }

    public int CreateNewBorrower(Borrower borrower) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn
                    .prepareStatement("INSERT INTO Borrower (FirstName, LastName, DateOfBirth, ContactPhone, ContactEmail, BorrowerType) OUTPUT INSERTED.BorrowerID VALUES (?, ?, ?, ?, ?, ?)");
            ps.setString(1, borrower.FirstName);
            ps.setString(2, borrower.LastName);
            ps.setLong(3, borrower.DateOfBirth);
            ps.setString(4, borrower.ContactPhone);
            ps.setString(5, borrower.ContactEmail);
            ps.setString(6, String.valueOf(borrower.BorrowerType));
            ResultSet rs = ps.executeQuery();
            rs.next();
            int BorrowerId = Integer.parseInt(rs.getString(1));
            return BorrowerId;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return -1;
        }
    }

    public boolean editBorrower(Borrower borrower) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn
                .prepareStatement("UPDATE Borrower SET FirstName = ?, LastName = ?, DateOfBirth = ?, ContactPhone = ?, ContactEmail = ?, BorrowerType = ? WHERE BorrowerID = ?");
                ps.setString(1, borrower.FirstName);
                ps.setString(2, borrower.LastName);
                ps.setLong(3, borrower.DateOfBirth);
                ps.setString(4, borrower.ContactPhone);
                ps.setString(5, borrower.ContactEmail);
                ps.setString(6, String.valueOf(borrower.BorrowerType));
                ps.setInt(7, borrower.BorrowerID);
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return false;
        }
    }    

    public boolean deleteBorrower(int borrowerID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE FROM Borrower WHERE BorrowerID = ?");
            ps.setInt(1, borrowerID);
            ps.execute();
            return true;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return false;
        }
    }    
    public String IssueBook(int BookID, int BorrowerID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("EXEC IssueBook ?, ?");
            ps.setInt(1, BookID);
            ps.setInt(2, BorrowerID);
            ps.executeQuery();
            return "OK";
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return e.getMessage();
        }
    }


    public String ReturnBook(int BookID, int BorrowerID, int IsDamagedOrLost){
        try(Connection conn = DataSource.getConnection()){
            PreparedStatement ps = conn.prepareStatement("EXEC ReturnBook ?, ?, ?");
            ps.setInt(1, BookID);
            ps.setInt(2, BorrowerID);
            ps.setInt(3, IsDamagedOrLost);
            ps.executeQuery();
            return "OK";
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return e.getMessage();
        }
    }

    public List<ObjectNode> getAuthorPage(int pageNo, int pageSize, int authorID, String searchQuery) {
        List<ObjectNode> authorsList = new ArrayList<ObjectNode>();
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("EXEC GetAuthorPage ?, ?, ?, ?");
            ps.setInt(1, pageNo);
            ps.setInt(2, pageSize);
            ps.setInt(3, authorID);
            ps.setString(4, searchQuery);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No author returned in page");
                return null;
            }
            while (rs.next()) {
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode objectNode = mapper.createObjectNode();
                objectNode.put("AuthorID", rs.getInt("AuthorID"));
                objectNode.put("FirstName", rs.getString("FirstName"));
                objectNode.put("LastName", rs.getString("LastName"));
                objectNode.put("Country", rs.getString("Country"));
                objectNode.put("ImageURL", rs.getString("ImageURL"));
                authorsList.add(objectNode);
            }
            return authorsList;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public List<ObjectNode> getAuthorPage(int pageNo){
        return getAuthorPage(pageNo, 10, 0, "");
    }
    public List<ObjectNode> searchAuthors(int pageNo, String searchQuery){
        return getAuthorPage(pageNo, 10, 0, searchQuery);
    }

    public List<ObjectNode> getBookPage(int pageNo, int pageSize, int bookID, String searchQuery) {
        List<ObjectNode> booksList = new ArrayList<ObjectNode>();
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("EXEC GetBookPage ?, ?, ?, ?");
            ps.setInt(1, pageNo);
            ps.setInt(2, pageSize);
            ps.setInt(3, bookID);
            ps.setString(4, searchQuery);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No book returned in page");
                return null;
            }
            while (rs.next()) {
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode objectNode = mapper.createObjectNode();
                objectNode.put("BookID", rs.getInt("BookID"));
                objectNode.put("Title", rs.getString("Title"));
                objectNode.put("Year", rs.getInt("Year"));
                objectNode.put("CoverURL", rs.getString("CoverURL"));
                objectNode.put("ISBN", rs.getInt("ISBN"));
                objectNode.put("RestrictionsID", rs.getInt("RestrictionsID"));
                JsonNode AuthorsJSON = mapper.readTree(rs.getString("Authors"));
                objectNode.set("Authors", AuthorsJSON);
                objectNode.put("AvailableCopies", rs.getInt("AvailableCopies"));
                booksList.add(objectNode);
            }
            return booksList;
        } catch (Exception e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public List<ObjectNode> getBookPage(int pageNo){
        return getBookPage(pageNo, 10, 0, "%");
    }
    public List<ObjectNode> getBookDetails(int bookID) {
        return getBookPage(0, 0, bookID, "%");
    }
    public List<ObjectNode> searchBooks(int pageNo, String searchQuery) {
        return getBookPage(pageNo, 10, 0, searchQuery);
    }

    public String getBorrowerPage(int pageNo, int pageSize, int defaultersOnly, int borrowerID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("EXEC GetBorrowerPage ?, ?, ?, ?");
            ps.setInt(1, pageNo);
            ps.setInt(2, pageSize);
            ps.setInt(3, defaultersOnly);
            ps.setInt(4, borrowerID);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No borrower returned in page");
                return null;
            }
            rs.next();
            String json_response = rs.getString(1);
            return json_response;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public String getBorrowerPage(int pageNo){
        return getBorrowerPage(pageNo, 10, 0, 0);
    }

    public String getBorrowerDetails(int borrowerID){
        return getBorrowerPage(0, 1, 0 ,borrowerID);
    }

    public String getDefaulterPage(int pageNo){
        return getBorrowerPage(pageNo, 10, 1 ,0);
    }

    public String markCopyAsDamaged(int bookID){
        try(Connection conn = DataSource.getConnection()){
            PreparedStatement ps = conn.prepareStatement("EXEC MarkCopyAsDamaged ?");
            ps.setInt(1, bookID);
            ps.execute();
            return "OK";
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return e.getMessage();
        }
    }

    public String getDashboardStats() {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("EXEC GetDashboardStats");
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No stats returned!");
                return null;
            }
            rs.next();
            String json_response = rs.getString(1);
            return json_response;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public List<ObjectNode> searchBorrowers(String searchQuery) {
        try (Connection conn = DataSource.getConnection()) {
            List<ObjectNode> searchResult = new ArrayList<ObjectNode>();
            PreparedStatement ps = conn.prepareStatement("SELECT BorrowerID, FirstName, LastName, BorrowerType"
                                            +" FROM Borrower WHERE FirstName LIKE ? OR LastName LIKE ?");
            ps.setString(1, "%"+searchQuery+"%");
            ps.setString(2, "%"+searchQuery+"%");
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No Borrowers match serach query!");
                return null;
            }
            while (rs.next()) {
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode objectNode = mapper.createObjectNode();
                objectNode.put("BorrowerID", rs.getInt("BorrowerID"));
                objectNode.put("FirstName", rs.getString("FirstName"));
                objectNode.put("LastName", rs.getString("LastName"));
                objectNode.put("BorrowerType", rs.getString("BorrowerType"));
                searchResult.add(objectNode);
            }
            return searchResult;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return null;
        }
    }
    
    public static String DeleteBook(int BookID, int isBorrowed) {
    	LOGGER.severe(BookID + " ::::: " + isBorrowed);
    	try(Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE TOP(1) FROM CopyInfo WHERE bookID = ? AND isBorrowed = ?");
            ps.setInt(1, BookID);
            ps.setInt(2, isBorrowed);
            ps.executeQuery();
            return "OK";
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
            return e.getMessage();
        }
    }

    public String generateReport(int reportID, String paramXML) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("EXEC GenerateReport ?, ?");
            ps.setInt(1, reportID);
            ps.setString(2, paramXML);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No response returned!");
                return null;
            }
            String json_response = ""; 
            while (rs.next()) {
                json_response += rs.getString(1);
            }
            return json_response;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public String viewAllReports() {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT ReportID, ReportName, ReportType FROM Report FOR JSON PATH");
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No response returned!");
                return null;
            }
            rs.next();
            String json_response = rs.getString(1);
            return json_response;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }

    public String getReportParams(int reportID) {
        try (Connection conn = DataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT Param = (SELECT ParamName, ParamType, ISNULL(ParamHint, ParamName) AS ParamHint, ParamDefault FROM ReportParam WHERE ReportID = ? FOR JSON PATH), "
                                                        +"Report = (SELECT ReportName FROM Report WHERE ReportID = ? FOR JSON PATH) FOR JSON PATH");
            ps.setInt(1, reportID);
            ps.setInt(2, reportID);
            ResultSet rs = ps.executeQuery();
            if (!rs.isBeforeFirst()) {
                LOGGER.info("No response returned!");
                return null;
            }
            rs.next();
            String json_response = rs.getString(1);
            return json_response;
        } catch (SQLException e) {
            LOGGER.severe(e.toString());
        }
        return null;
    }
}
