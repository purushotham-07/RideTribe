# Multi-stage Dockerfile for RideTribe Backend
# Stage 1: Build
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app

# Copy Maven wrapper & POM
COPY mvnw pom.xml ./
COPY .mvn .mvn

RUN chmod +x mvnw
# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root user for security
RUN groupadd -r ridetribe && useradd -r -g ridetribe ridetribe
USER ridetribe

COPY --from=builder /app/target/backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
