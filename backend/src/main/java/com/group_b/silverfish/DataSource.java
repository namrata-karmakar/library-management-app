package com.group_b.silverfish;

import java.sql.Connection;
import java.sql.SQLException;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DataSource {
    private static HikariConfig config = new HikariConfig();
    private static HikariDataSource ds;

    static {
        config.setJdbcUrl("jdbc:sqlserver://host-zero-server.database.windows.net:1433;databaseName=host-zero");
        config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        config.setUsername("roshan");
        config.setPassword("zyEboKnd13APEhv7R2ox4Q");
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        ds = new HikariDataSource(config);
    }

    private DataSource() {
    }

    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }
}
