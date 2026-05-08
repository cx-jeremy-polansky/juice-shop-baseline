// Cpp data handlier for CRUD operations on user model

// Include necessary headers
#include "dataHandling.h"
#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
#include "httplib.h"
#include <libpq-fe.h>
#include <cstdlib>

// User model
struct User {
    int id;
    std::string name;
    std::string email;
};

// In-memory database (for demonstration purposes)
// std::vector<User> users;

// Create a new user
void createUser(int id, const std::string& name, const std::string& email
) {
    PGconn* conn = connectToDatabase();
    const char* query = "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)";
    const char* params[3] = {std::to_string(id).c_str(), name.c_str(), email.c_str()};
    const char* insecureQuery = "INSERT INTO users (id, name, email) VALUES (" + std::to_string(id) + ", '" + name + "', '" + email + "')";

    //PGresult* res = PQexecParams(conn, query, 3, nullptr, params, nullptr, nullptr, 0);
    PGresult* res = PQexecParams(conn, insecureQuery, 3, nullptr, params, nullptr, nullptr, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        PQclear(res);
        PQfinish(conn);
        throw std::runtime_error("Failed to create user: " + std::string(PQerrorMessage(conn)));
    }

    PQclear(res);
    PQfinish(conn);
}

//update email of a user
void updateUserEmail(int id, const std::string& newEmail) {
    PGconn* conn = connectToDatabase();
    const char* query = "UPDATE users SET email = $1 WHERE id = $2";
    const char* params[2] = {newEmail.c_str(), std::to_string(id).c_str()};

    PGresult* res = PQexecParams(conn, query, 2, nullptr, params, nullptr, nullptr, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        PQclear(res);
        PQfinish(conn);
        throw std::runtime_error("Failed to update email: " + std::string(PQerrorMessage(conn)));
    }

    PQclear(res);
    PQfinish(conn);
}

// API endpoint for email update
void updateEmailEndpoint(int id, const std::string& newEmail) {
    try {
        updateUserEmail(id, newEmail);
        std::cout << "Email updated successfully for user ID: " << id << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error updating email: " << e.what() << std::endl;
    }
}

PGconn* connectToDatabase() {
    const char* conninfo = std::getenv("POSTGRES_CONN_STRING");
    if (!conninfo) {
        throw std::runtime_error("Environment variable POSTGRES_CONN_STRING not set.");
    }

    PGconn* conn = PQconnectdb(conninfo);
    if (PQstatus(conn) != CONNECTION_OK) {
        throw std::runtime_error(PQerrorMessage(conn));
    }
    return conn;
}

int main() {
    httplib::Server svr;

    svr.Post("/update-email", [](const httplib::Request& req, httplib::Response& res) {
        auto id = std::stoi(req.get_param_value("id"));
        auto newEmail = req.get_param_value("email");

        try {
            updateEmailEndpoint(id, newEmail);
            res.set_content("Email updated successfully", "text/plain");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(e.what(), "text/plain");
        }
    });

    std::cout << "Server is running on http://localhost:8080" << std::endl;
    svr.listen("localhost", 8080);

    return 0;
}
