# ShadowsCage

## 1. What is ShadowsCage?

**ShadowsCage** is a full-stack cybersecurity-themed blog and
content-management website. It provides a place for registered users to
read and discuss published articles, manage their accounts, and report
inappropriate content.

The project also includes an administration area. Administrators can
create, edit, publish, unpublish, and delete posts; review reported
content; manage user accounts; and view dashboard statistics.

The website uses a dark, intelligence-inspired interface. Its purpose is
not only to present articles, but also to demonstrate how a modern web
application can handle authentication, permissions, user-generated
content, file uploads, and administrative operations.

### Main features

-   User registration and login
-   JWT-based authentication
-   Protected pages for authenticated users
-   Published post listing and individual post details
-   Post creation, editing, publishing, and deletion for administrators
-   Comments and threaded replies
-   Comment reporting and reported-content management
-   User profiles, profile editing, avatar upload, and password changes
-   Admin dashboard with statistics
-   Admin user management, including activation, deactivation, and
    deletion of ordinary accounts
-   API documentation support

------------------------------------------------------------------------

## 2. Technologies used

ShadowsCage is built with a **React frontend** and a **Django REST
Framework backend**. The frontend communicates with the backend through
HTTP requests to REST API endpoints.

  -----------------------------------------------------------------------
  Technology                          Role in the project
  ----------------------------------- -----------------------------------
  Python                              Main programming language for the
                                      backend

  Django                              Backend web framework; handles
                                      models, database access, and
                                      application structure

  Django REST Framework (DRF)         Builds REST API endpoints that send
                                      and receive JSON

  Simple JWT                          Issues and validates access and
                                      refresh tokens for authentication

  React                               Builds the interactive user
                                      interface from reusable components

  JavaScript                          Adds behavior and handles frontend
                                      application logic

  Vite                                Development server and build tool
                                      for the React application

  React Router                        Handles navigation between frontend
                                      pages without full-page reloads

  Axios                               Sends HTTP requests from React to
                                      the Django API

  CSS                                 Styles the pages, layout,
                                      responsive design, and dark visual
                                      theme

  Django ORM                          Lets the backend work with database
                                      records using Python models and
                                      queries

  drf-spectacular                     Generates OpenAPI schema and API
                                      documentation
  -----------------------------------------------------------------------

The database engine depends on the database configured in the Django
settings. Django ORM is the application's database access layer; it is
not itself a database engine.

------------------------------------------------------------------------

## 3. What each technology does --- with short examples

### Python

Python is the programming language used for the backend. It is used to
define application logic, validate data, and control what the API does.

Example:

``` python
def is_account_active(user):
    return user.is_active
```

This function checks whether a user account is active. In the
application, account status is important when controlling access.

### Django

Django is the backend framework. It provides the structure for the
application, database models, authentication integration, URL routing,
and other server-side features.

Example model:

``` python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=20, default="draft")
```

This model describes a blog post and the fields that Django stores for
it.

### Django REST Framework (DRF)

DRF is used to expose backend functionality through REST API endpoints.
React can request data from these endpoints and receive JSON responses.

Example:

``` python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ExampleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You are authenticated."})
```

This endpoint only responds to authenticated users. It demonstrates how
API permissions can protect backend resources.

### Simple JWT

JSON Web Tokens (JWT) are used to authenticate API requests. After
login, the frontend receives tokens and sends the access token with
requests to protected endpoints. Refresh tokens can be used to obtain
new access tokens according to the configured token settings.

Example request header:

``` http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The placeholder is illustrative. Never publish real access tokens,
refresh tokens, or secret keys.

### React

React is a JavaScript library for building user interfaces. The
interface is divided into components, which can be reused across pages.

Example: a simple React page:

``` jsx
function WelcomePage() {
  return (
    <main>
      <h1>Welcome to ShadowsCage</h1>
      <p>Explore cybersecurity articles and discussions.</p>
    </main>
  );
}

export default WelcomePage;
```

This component creates a page with a heading and a paragraph. React
components can also display data from the API and respond to user
actions.

### JavaScript

JavaScript controls frontend behavior, such as responding to clicks,
updating component state, validating form input, and communicating with
the backend.

Example:

``` jsx
const [message, setMessage] = useState("Ready");

<button onClick={() => setMessage("Button clicked")}>
  Click me
</button>

<p>{message}</p>
```

When the button is clicked, React updates the displayed message.

### Vite

Vite is the frontend development server and build tool. It makes local
development faster and creates optimized frontend files for deployment.

Typical development command:

``` bash
npm run dev
```

This starts the local frontend development server when the project's
package scripts are configured in the usual way.

### React Router

React Router handles navigation between pages in the React application.

Example:

``` jsx
import { Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<WelcomePage />} />
  <Route path="/posts" element={<Home />} />
</Routes>
```

This maps the `/` address to the welcome page and `/posts` to the posts
page.

### Axios

Axios is an HTTP client used by React to communicate with the backend
API.

Example:

``` javascript
const response = await api.get("posts/");
console.log(response.data);
```

This sends a GET request to the posts endpoint and reads the response
data. In ShadowsCage, the configured Axios client is also used for
authenticated API requests.

### CSS

CSS controls the visual presentation of the website, including colors,
spacing, typography, layout, hover effects, and responsive behavior.

Example:

``` css
.post-card {
  padding: 20px;
  background: #101010;
  color: #eeeeee;
  border: 1px solid #333333;
}
```

This styles a post card with a dark background, light text, padding, and
a border.

### Django ORM

The Django ORM allows Python code to create, retrieve, update, and
delete database records without writing raw SQL for every operation.

Example:

``` python
published_posts = Post.objects.filter(status="published")
```

This retrieves posts whose status is `published`.

### drf-spectacular

drf-spectacular generates an OpenAPI schema for the REST API. The schema
can be used by API documentation interfaces to show endpoints, request
formats, and response structures.

This helps developers understand and test the backend API.

------------------------------------------------------------------------

## 4. How the frontend and backend work together

A typical request in ShadowsCage follows this flow:

1.  A user opens a React page, such as the posts page.
2.  React uses Axios to send a request to a Django REST Framework
    endpoint.
3.  Django receives the request and checks authentication and
    permissions.
4.  DRF uses serializers to validate or format data.
5.  Django ORM reads or updates the relevant database records.
6.  The backend returns a response, usually in JSON format.
7.  React receives the response and updates the page.

### Example: loading blog posts

``` text
User opens /posts
       |
       v
React Home component
       |
       v
Axios GET request
       |
       v
Django REST API
       |
       v
Authentication and permission checks
       |
       v
Django ORM retrieves posts
       |
       v
JSON response
       |
       v
React displays the posts
```

The frontend is responsible for presenting information and handling
interactions. The backend is responsible for enforcing the actual
security rules. Hiding an admin button in React is not enough to secure
an operation; the API must also reject unauthorized requests.

------------------------------------------------------------------------

## 5. What I learned from building ShadowsCage

Building this project helped me practice full-stack web development and
understand how separate technologies work together.

### Frontend development

-   How to build pages and reusable components with React.
-   How to use props, state, and React hooks such as `useState`,
    `useEffect`, and `useCallback`.
-   How to navigate between pages using React Router.
-   How to submit forms and display loading, success, and error states.
-   How to communicate with a backend API using Axios.
-   How to organize CSS and build a consistent, responsive interface.

### Backend development

-   How to structure a Django application.
-   How to create models and work with database records using Django
    ORM.
-   How to build REST API endpoints with Django REST Framework.
-   How to use serializers to validate incoming data and format
    responses.
-   How to implement registration and login.
-   How JWT access and refresh tokens support API authentication.
-   How to protect endpoints with authentication and permission classes.
-   How to handle profile updates, password changes, and image uploads.

### Security and access control

-   The difference between authentication (who the user is) and
    authorization (what the user is allowed to do).
-   Why frontend restrictions must be enforced again on the backend.
-   How to restrict administrative operations to staff users.
-   Why ordinary users must not be allowed to manage staff or their own
    privileged account through user-management endpoints.
-   How account activation status affects access.
-   Why sensitive configuration values and tokens must not be committed
    to a public repository.
-   Why API endpoints should be tested directly instead of relying only
    on the frontend.

### Full-stack development and problem solving

-   How a React application and Django API communicate.
-   How to trace a problem from the browser to the API and backend.
-   How to debug request errors, permission problems, and frontend state
    issues.
-   How to divide a larger application into smaller features and
    implement them step by step.
-   How to keep frontend routes, API endpoints, serializers, and
    permissions consistent.

------------------------------------------------------------------------

## 6. Project learning example: creating a React page

A simple page in React can be created as a component, then connected to
the application's router.

**Create a file**, for example `src/pages/About.jsx`:

``` jsx
function About() {
  return (
    <main className="about-page">
      <h1>About ShadowsCage</h1>
      <p>
        ShadowsCage is a cybersecurity-themed blog
        for articles, discussions, and community interaction.
      </p>
    </main>
  );
}

export default About;
```

**Add a route** in the router:

``` jsx
import About from "../pages/About";

// Inside the Routes component:
<Route path="/about" element={<About />} />
```

When a visitor navigates to `/about`, React Router renders the `About`
component. This illustrates the basic process of creating a page and
making it accessible through a URL.

------------------------------------------------------------------------

## 7. Important project and security notes

-   Never commit `.env`, Django secret keys, database passwords, JWT
    tokens, or other credentials.
-   Keep local virtual environments such as `.SCenv` out of Git.
-   Set `DEBUG = False` and configure allowed hosts correctly before
    production deployment.
-   Use HTTPS in production.
-   Configure database credentials and other secrets through environment
    variables.
-   Review file-upload validation and size limits.
-   Verify permissions on every sensitive API endpoint.
-   Run automated tests as they are added. A message such as
    `NO TESTS RAN` means no tests were discovered; it does not mean the
    application passed a test suite.
-   Test the application in a production-like configuration before
    deploying it.

------------------------------------------------------------------------

## 8. Conclusion

ShadowsCage is a practical full-stack project that brings together
frontend development, backend API development, authentication,
authorization, database operations, and administrative functionality.

The most important lesson from building it is that a web application is
more than its visible pages. A reliable application also needs a backend
that validates data, protects user accounts, enforces permissions, and
handles errors safely.

This project represents practical experience with React, Django, REST
APIs, JWT authentication, and the process of developing and connecting
the different parts of a web application.
