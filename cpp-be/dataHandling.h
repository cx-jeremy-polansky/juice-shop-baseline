#pragma once
#include <string>
#include <libpq-fe.h>

PGconn* connectToDatabase();
void createUser(int id, const std::string& name, const std::string& email);
void updateUserEmail(int id, const std::string& newEmail);
void updateEmailEndpoint(int id, const std::string& newEmail);
