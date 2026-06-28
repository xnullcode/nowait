# Nowait

A cloud-native microservices application designed for order management and kiosk operations. The architecture operates on a database-per-service pattern, utilizing a React frontend and multiple Spring Boot backends, all orchestrated via Kubernetes.

## Architecture & Techniques

- **Microservices Routing & CORS Mitigation:** Utilizes [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway) alongside an Nginx proxy layer within the frontend container. This intercepts and routes API requests to internal Kubernetes services, neutralizing complex cross-origin resource sharing requirements.
- **Stateless Authentication:** The Auth Service generates asymmetric RSA-signed JWT tokens. Downstream services validate these tokens statelessly using public keys.
- **Zero-Trust Frontend Routing:** Mitigates [Forced Browsing](https://owasp.org/www-community/Access_Control_Flaws) vulnerabilities. The application passes temporary authorization payloads via React Router state and immediately purges them using the [History API's `replaceState` method](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState). This guarantees strict access control across session boundaries.
- **Client-Side Storage:** Implements the [Web Storage API (`localStorage`)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for secure JWT persistence and session state management.
- **Swappable Storage Interfaces:** The Menu Service implements a modular `StorageService` interface allowing seamless profile-based switching between local file storage and cloud storage.
- **Declarative Infrastructure:** Relies on Kubernetes ConfigMaps and Secrets for environment injection, ensuring configuration is separated from the application codebase.

## Technologies & Libraries

- **Frontend:** [React 19](https://react.dev/) built with [Vite](https://vitejs.dev/) and managed via the Context API.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Icons:** [Lucide React](https://lucide.dev/) for lightweight, customizable SVG icons.
- **Typography:** [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) via Google Fonts, paired with a custom local `Loubag` typeface.
- **Backend Services:** [Spring Boot](https://spring.io/projects/spring-boot) managing the API microservices.
- **Database:** [PostgreSQL](https://www.postgresql.org/) for relational data persistence.
- **Payments:** [Razorpay API](https://razorpay.com/) for transaction processing.
- **Image Storage:** [Cloudinary](https://cloudinary.com/) for production image hosting.
- **Orchestration:** [Kubernetes](https://kubernetes.io/) and [Docker](https://www.docker.com/) for containerization and cluster management.

## Project Structure

```text
/
├── auth-service/
├── frontend/
├── gateway-service/
├── k8s/
│   ├── auth/
│   ├── base/
│   ├── gateway/
│   ├── menu/
│   ├── order/
│   ├── payment/
│   └── postgres/
├── menu-service/
├── order-service/
├── payment-service/
└── .gitignore
```

*   [`auth-service/`](./auth-service/): Manages users, tenants, and asymmetric JWT generation.
*   [`frontend/`](./frontend/): The Vite/React client application, containing the multi-tenant dashboard and Nginx configurations.
*   [`gateway-service/`](./gateway-service/): Spring Cloud Gateway routing incoming requests to appropriate downstream services.
*   [`k8s/`](./k8s/): Kubernetes configuration manifests. The [`k8s/base/`](./k8s/base/) directory holds environment variables and secret templates, while the other directories define the deployments and internal cluster services for the application.
*   [`menu-service/`](./menu-service/): Manages products, categories, stock, and file uploads.
*   [`order-service/`](./order-service/): Manages cart checkouts and order history, communicating synchronously with the Menu Service for stock validation.
*   [`payment-service/`](./payment-service/): Handles Razorpay integration and payment verification payloads.
