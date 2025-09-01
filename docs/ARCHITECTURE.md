# Project Architecture

This project follows the Clean Architecture pattern, organizing code into distinct layers to improve maintainability, scalability, and testability.

## Layers

### 1. Data Layer
- **Responsibility:** Handles data sources (APIs, databases, local storage).
- **Components:** Repositories, data mappers, external service integrations.

### 2. Domain Layer
- **Responsibility:** Contains business logic and rules.
- **Components:** Use cases, entities, domain services.

### 3. Presentation Layer
- **Responsibility:** Manages UI and user interaction.
- **Components:** Views, controllers, state management.

## Flow
- The Presentation Layer interacts with the Domain Layer via use cases.
- The Domain Layer communicates with the Data Layer through repositories.

## Benefits
- Separation of concerns
- Easier testing
- Scalable and maintainable codebase

---

For more details, see [Self-Hosting Guide](SELF_HOSTING_GUIDE.md).
