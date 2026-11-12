
# Build the Spring Boot application
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

# Run the packaged application
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN groupadd --system spring \
    && useradd --system --gid spring spring

COPY --from=build /app/target/*.jar app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
