# --- Stage 1: Build Stage ---
# Use an official Maven image that includes JDK 21
FROM maven:3.9.7-eclipse-temurin-21 AS build
LABEL authors="Konstantinos Pisimisis"

WORKDIR /app

# Copy the pom.xml file first
COPY pom.xml .

# Download all dependencies
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application
RUN mvn package -DskipTests

# --- Stage 2: Run Stage ---
# Use a minimal, official Java 21 runtime image
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the executable .jar file from the 'build' stage
# The jar will be named team-service-0.0.1-SNAPSHOT.jar
COPY --from=build /app/target/*.jar app.jar

# Expose the port that the Spring Boot application runs on
EXPOSE 8081

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]