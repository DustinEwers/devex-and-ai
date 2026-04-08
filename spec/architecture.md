Application Architecture: 

This is a classic 3 layer architecture that has an API layer, a frontend layer, and a postgres database. 

Tech Stack: 

Frontend: 
The frontend uses React
The frontend is containerized

API Layer: 
.NET 9.0
Authentication is OAuth with Azure Entra
Data layer is Code First Entity Framework pointing at a postgres datbase

Database: 
Postgres running in a container

The application runs with a docker compose file for easy local development