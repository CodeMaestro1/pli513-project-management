# --- Stage 1: Build Stage ---
# Use an official Maven image that includes JDK 21 to build the application
FROM maven:3.9.7-eclipse-temurin-21 AS build
LABEL authors="Konstantinos Pisimisis"

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml file first to leverage Docker layer caching
COPY pom.xml .

# Download all dependencies
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application, skipping the tests (we already ran them)
RUN mvn package -DskipTests

# --- Stage 2: Run Stage ---
# Use a minimal, official Java 21 runtime image
FROM eclipse-temurin:21-jre-jammy

# Set the working directory
WORKDIR /app

# Copy the executable .jar file from the 'build' stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port that the Spring Boot application runs on (default 8080)
EXPOSE 8080

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]