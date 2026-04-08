
## Project Overview
Cheersly is a workplace recognition app where employees give compliments and recognition to coworkers using a monthly point allocation system (50 points per month to give away).

## Architecture & Tech Stack
- **3-layer architecture**: React frontend, .NET 10.0 API, PostgreSQL database
- **Authentication**: OAuth with Azure Entra ID
- **Data Layer**: Code First Entity Framework Core
- **Containerization**: All services run in Docker containers
- **Development**: Docker Compose for local development

## Core Domain Model
- **Users**: Email (username), first/last name, points to give (monthly allocation), points received (accumulated), role (Normal/Admin)
- **Cheers**: Target user(s), points per person, rich text message with markdown/hashtags/images
- **Point System**: 50 points monthly allocation (resets), accumulated received points (persistent)

## Key Pages & Features
- **Main Feed**: Public chronological feed of all shout-outs
- **Profile**: Personal giving/receiving history and point balance
- **New Cheers**: Rich text editor with user selector and point allocation
- **Store**: Point redemption system
- **Admin Pages**: Admin-only views (role-based access)

## Development Conventions
- Follow .NET 10.0 patterns for API development
- Use Entity Framework Code First migrations for database changes
- React components should handle the rich text editing capabilities
- Styling should use the Tailwind CSS framework
- OAuth integration with Azure Entra for authentication
- Container-first development with Docker Compose
- Keep it simple. Don't over-engineer solutions. 
- Avoid comment span. Let the code speak for itself and only add comments to explain non-standard logic or to document public methods and API endpoints.

## Project Structure Expectations
When implementing, follow standard patterns:
- `/src/api/` - .NET API project
- `/src/frontend/` - React application
- `/docker-compose.yml` - Local development setup
- Entity models should reflect the points allocation and accumulation system
- API controllers for Cheers, Users, Admin functions

## Important Business Rules
- Monthly point allocation resets (50 points to give)
- Received points accumulate permanently
- Points cannot exceed current allocation when giving
- Admin role controls access to admin pages
- Rich text messages support markdown, hashtags, and images

## Development Workflow
Use Docker Compose for local development to ensure consistency across all services (frontend, API, database).