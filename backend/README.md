# silverfish

**Build Notes**
1. Navigate to the project folder 
2. Run `mvnw clean package -DskipTests` to build the jar file
3. Locate the jar file that was just built in `.\target` folder
4. Run `java -jar silverfish-0.0.1-SNAPSHOT.jar` to start the spring service for silverfish
5. Import the latest `Silverfish.postman_collection.json` to postman and test the APIs!

**General Notes**
- Please update postman api specific documentation if any endpoint quirks are not mentioned in code
