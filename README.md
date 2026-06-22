# Nowait

Nowait is an open-source, multi-tenant SaaS platform for cafe self-ordering. Customers place orders from a touchscreen kiosk — no queue, no counter staff required. Cafe owners get a real-time order dashboard, a product management panel, and integrated online payments, all from a single hosted deployment.

The project is split into a React frontend ([`frontend/`](./frontend)) and a Spring Boot backend ([`backend/`](./backend)).

**Live demo:** [nowait-mauve.vercel.app](https://nowait-mauve.vercel.app)

---

## Interesting Techniques

**Scroll-position-driven active navigation links**
[`LandingPage.jsx`](./frontend/src/pages/LandingPage.jsx) uses a [`scroll`](https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event) event listener combined with [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) to determine which section is currently in the top third of the viewport. The active nav link updates live as the user scrolls.

**Dynamic script injection for third-party SDKs**
[`CheckoutPage.jsx`](./frontend/src/pages/CheckoutPage.jsx) loads the Razorpay checkout script on demand by appending a `<script>` tag to the document via the [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement). The script is only fetched when the user initiates a payment, and it checks for an existing element by `id` to avoid double-loading.

**HMAC-SHA256 payment signature verification**
[`PaymentController.java`](./backend/src/main/java/com/xnullcode/nowait/controller/PaymentController.java) re-computes the Razorpay webhook signature server-side using Java's [`javax.crypto.Mac`](https://docs.oracle.com/en/java/se/21/docs/api/java.base/javax/crypto/Mac.html) with `HmacSHA256`, then compares it to the value sent by Razorpay. This prevents a tampered or replayed payment confirmation from placing an order.

**Lazy-initialized React state from `localStorage`**
[`CartContext.jsx`](./frontend/src/context/CartContext.jsx) passes a function to `useState` so the initial cart is read from [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) exactly once at mount, avoiding repeated reads on every render. Cart state is synced back to `localStorage` in a `useEffect`.

**Stock enforcement on both client and server**
Cart mutations in [`CartContext.jsx`](./frontend/src/context/CartContext.jsx) check `item.stock` before incrementing quantity. The same check runs in [`PaymentController.java`](./backend/src/main/java/com/xnullcode/nowait/controller/PaymentController.java) before the order is committed to the database, so the client-side guard is never the only line of defence.

**Axios request interceptor for JWT injection**
[`axiosConfig.js`](./frontend/src/api/axiosConfig.js) registers an [Axios request interceptor](https://axios-http.com/docs/interceptors) that reads the JWT from `localStorage` and attaches it as a `Bearer` token on every outgoing request. No individual call site needs to handle auth headers.

**`OncePerRequestFilter` JWT chain in Spring Security**
[`JwtFilter.java`](./backend/src/main/java/com/xnullcode/nowait/security/JwtFilter.java) extends Spring's `OncePerRequestFilter`, extracting and validating the JWT then writing a `UsernamePasswordAuthenticationToken` to the [`SecurityContextHolder`](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder). This makes the authenticated user's ID available anywhere in the request via `@AuthenticationPrincipal`.

**`useRef` for toast debouncing without re-renders**
[`MenuPage.jsx`](./frontend/src/pages/MenuPage.jsx) stores the toast `setTimeout` handle in a [`useRef`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout), so clearing and resetting the timeout on rapid add-to-cart actions does not trigger an extra render cycle.

**`@PostConstruct` for SDK client initialization**
[`PaymentController.java`](./backend/src/main/java/com/xnullcode/nowait/controller/PaymentController.java) uses [`@PostConstruct`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/postconstruct) to initialize the `RazorpayClient` once after Spring injects `@Value` fields. This is cleaner than constructor injection when the initialization can throw a checked exception.

---

## Technologies and Libraries

**Backend**

| Library | Notes |
|---|---|
| [Spring Boot 3.4](https://spring.io/projects/spring-boot) | Main application framework. Uses Spring Web, Spring Data JPA, and Spring Security. |
| [JJWT 0.12.5](https://github.com/jwtk/jjwt) | JWT creation and validation. The `jjwt-api` / `jjwt-impl` split means the parsing implementation is a runtime-only dependency. |
| [Cloudinary SDK (`cloudinary-http45`)](https://cloudinary.com/documentation/java_integration) | Image upload and storage. The `http45` variant bundles Apache HttpClient 4.5 rather than requiring the host app to supply one. |
| [Razorpay Java SDK 1.4.5](https://github.com/razorpay/razorpay-java) | Creates payment orders and wraps the Razorpay REST API. Signature verification is done manually with `javax.crypto.Mac` rather than using SDK helpers. |
| [PostgreSQL driver](https://jdbc.postgresql.org/) | Runtime JDBC driver. Connection URL, username and password are all externalized via environment variables. |

**Frontend**

| Library | Notes |
|---|---|
| [React 19](https://react.dev/) | UI framework. Uses the Context API for cart state and React Router v7 for client-side routing. |
| [React Router v7](https://reactrouter.com/) | Handles all client-side routing including protected route wrappers. |
| [Axios 1.x](https://axios-http.com/) | HTTP client. A single configured instance in [`axiosConfig.js`](./frontend/src/api/axiosConfig.js) is shared across the app. |
| [Lucide React](https://lucide.dev/) | Icon set. Imported individually per file so unused icons are tree-shaken at build time. |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS. The v4 Vite plugin replaces the traditional PostCSS setup. Custom theme tokens are defined in [`index.css`](./frontend/src/index.css) using the `@theme` block. |
| [Vite 8](https://vite.dev/) | Build tool and dev server. |
| [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Unit and component testing. |

**Fonts**

- [Inter](https://fonts.google.com/specimen/Inter) — loaded as the default `font-sans` via the Tailwind theme.
- Loubag — a locally hosted custom typeface served from [`frontend/public/assets/fonts/`](./frontend/public/assets/fonts/) using a `@font-face` declaration in [`index.css`](./frontend/src/index.css).

---

## Project Structure

```
nowait/
├── LICENSE
├── .gitignore
├── backend/
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/
│       └── main/
│           ├── java/com/xnullcode/nowait/
│           │   ├── NowaitApplication.java
│           │   ├── config/
│           │   ├── controller/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── repository/
│           │   ├── security/
│           │   └── service/
│           └── resources/
│               └── application.properties
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── vercel.json
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── public/
            └── assets/
                ├── fonts/
                └── (category and hero images)
```

**`backend/src/main/java/.../security/`** — Contains the `JwtFilter`, `JwtUtil`, `SecurityConfig`, and a custom `CafeUserDetails` principal that carries the tenant user ID through the Spring Security context.

**`backend/src/main/java/.../service/`** — Includes `FileStorageService`, which abstracts Cloudinary uploads so the controllers stay decoupled from the storage provider.

**`frontend/src/context/`** — Holds `CartContext`, the single piece of shared client state. Everything else is fetched directly from the API per page.

**`frontend/src/api/`** — A single `axiosConfig.js` file configures the shared Axios instance with the base URL and JWT interceptor.

**`frontend/public/assets/fonts/`** — Local font files, including Loubag, served as static assets by Vite.

---

## Environment Variables

**Backend** — set these before starting the Spring Boot application.

| Variable | Description |
|---|---|
| `DATABASE_URL` | JDBC connection string (defaults to `jdbc:postgresql://localhost:5432/cafe_db`) |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRATION` | Token expiry in milliseconds |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay publishable key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (used for HMAC verification) |
| `PORT` | Server port (defaults to `8080`) |

**Frontend** — place in a `.env` file at the root of the `frontend/` directory.

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (defaults to `http://localhost:8080`) |

---

## License

[Apache 2.0](./LICENSE)
