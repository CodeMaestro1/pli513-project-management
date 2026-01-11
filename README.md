# pli513-project-management

This repository contains the code for a project developed as part of the **PLI513** course at the **Technical University of Crete (TUC)**.

## Project Overview

This project focuses on the development of a web application, similar to Jira, designed for project management and issue tracking.

The main goal is to demonstrate good software engineering practices in a **microservices-based web application**. Each service is separated and runs independently to highlight this architecture.

The backend is implemented using **Spring Boot**, while the frontend is built using **Bun**.

Bun is used as the JavaScript runtime for the frontend. It serves as a replacement for Node.js and npm,
handling dependency installation and frontend build tasks.

## Execution

Before running the application, you must configure the environment variables.

1. Fill in the `.env.example` file and rename it to `.env`.
2. Generate a secure JWT secret (using `openssl` is recommended).
3. Configure the MySQL username and password.
4. Set the MongoDB password.

After completing the configuration, ensure that **Docker** is installed and running.
Make sure you are in the directory that contains `docker-compose.yml`, then run:

```bash
docker compose build
docker compose up --quiet
```

The `--quiet` flag is optional but recommended to reduce terminal output.

Once the services are running, the application will be available at:

```
http://localhost:5173/
```

## Pre-installed Users

During development, dummy data were generated for testing purposes, including an **Admin** user.

The initialization logic can be found in:

```
user-service/src/main/java/com/pms/userservice/config/DataInitializer.java
```

Refer to this file for details about the pre-configured users and roles.

````markdown
## Default Credentials for admin

```
Admin User:
- Username: admin
- Password: admin123
```
````
