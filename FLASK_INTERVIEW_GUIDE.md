# Flask Interview Preparation Guide
## Based on Incident Response Management System (IRMS) Project

---

## Table of Contents
1. [Flask Fundamentals](#1-flask-fundamentals)
2. [Project Architecture & Structure](#2-project-architecture--structure)
3. [Database Integration with SQLAlchemy](#3-database-integration-with-sqlalchemy)
4. [Authentication & Security](#4-authentication--security)
5. [Email Integration](#5-email-integration)
6. [Frontend-Backend Connectivity](#6-frontend-backend-connectivity)
7. [RESTful API Design](#7-restful-api-design)
8. [Database Migrations](#8-database-migrations)
9. [Session Management](#9-session-management)
10. [Error Handling](#10-error-handling)
11. [Environment Configuration](#11-environment-configuration)
12. [CI/CD with GitHub Actions](#12-cicd-with-github-actions)
13. [Production Deployment](#13-production-deployment)
14. [Common Interview Questions](#14-common-interview-questions)

---

## 1. Flask Fundamentals

### What is Flask?
Flask is a **lightweight WSGI web application framework** written in Python. It's designed to make getting started quick and easy, with the ability to scale up to complex applications.

### Why Flask? (Compared to Django)
- **Microframework**: Minimal and flexible
- **Unopinionated**: You choose your tools and libraries
- **Easy to learn**: Simple core with extensions
- **Perfect for APIs**: Lightweight for RESTful services

### Basic Flask Application Structure
```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
```

### Key Concepts from IRMS Project:

**Application Initialization:**
```python
from flask import Flask
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")  # For session management
```

**Interview Question**: *Why do we use `load_dotenv()`?*
- **Answer**: To load environment variables from `.env` file, keeping sensitive data (API keys, database credentials) out of version control.

---

## 2. Project Architecture & Structure

### MVC Pattern in Flask

**IRMS Project Structure:**
```
IRMS/
├── app.py                 # Controller + Routes
├── templates/             # Views (HTML)
│   ├── index.html
│   ├── dashboard.html
│   ├── loginForm1.html
│   └── ...
├── static/               # Static assets
│   ├── CSS/
│   └── JS/
├── migrations/           # Database migrations
├── requirements.txt      # Dependencies
├── .env                  # Environment variables (not in git)
├── vercel.json          # Deployment config
└── .github/workflows/   # CI/CD pipelines
```

### Application Factory Pattern
While our IRMS uses direct initialization, in larger apps you'd use:

```python
def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    mail.init_app(app)
    
    return app
```

**Interview Question**: *What is the Application Factory Pattern?*
- **Answer**: A design pattern where you create a function that returns a Flask application instance, allowing multiple instances with different configurations (testing, production).

---

## 3. Database Integration with SQLAlchemy

### What is SQLAlchemy?
An **ORM (Object-Relational Mapping)** library that lets you interact with databases using Python objects instead of SQL queries.

### Configuration in IRMS:
```python
from flask_sqlalchemy import SQLAlchemy

# Database URI construction
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
hostname = os.getenv("DB_HOST")
database_name = os.getenv("DB_NAME")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+mysqlconnector://{username}:{password}@{hostname}/{database_name}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
```

**Interview Question**: *Why set `SQLALCHEMY_TRACK_MODIFICATIONS` to False?*
- **Answer**: It disables Flask-SQLAlchemy's event system that tracks modifications and emits signals. This saves memory and improves performance.

### Model Definition

**User Model:**
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
```

**Incident Model with Relationships:**
```python
class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.String(36), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="Reported")
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user_email = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def __init__(self, title, description, user_id):
        self.title = title
        self.description = description
        self.user_id = user_id
        self.user_email = User.query.filter_by(id=user_id).first().email
        self.incident_id = str(uuid.uuid4())  # Auto-generate UUID
```

**Response Model:**
```python
class Response(db.Model):
    response_id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.String(36), db.ForeignKey('incident.incident_id'), nullable=False)
    responded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    responder_email = db.Column(db.String(150), nullable=False)
    responder_username = db.Column(db.String(50), nullable=False)
```

### Database Operations

**CRUD Operations:**

**Create:**
```python
new_user = User(username=username, email=email, password=hashed_password)
db.session.add(new_user)
db.session.commit()
```

**Read:**
```python
# Single record
user = User.query.filter_by(username=username).first()

# All records
incidents = Incident.query.all()

# Filtered query
user_incidents = Incident.query.filter_by(user_id=session['user_id']).all()

# Excluding current user
public_incidents = Incident.query.filter(Incident.user_id != current_user_id).all()
```

**Update:**
```python
incident = Incident.query.get(incident_id)
incident.status = "Resolved"
db.session.commit()
```

**Delete:**
```python
user = User.query.get(user_id)
db.session.delete(user)
db.session.commit()
```

**Interview Question**: *What's the difference between `.first()` and `.one()`?*
- **Answer**: 
  - `.first()` returns the first result or None
  - `.one()` raises an exception if 0 or more than 1 result found

---

## 4. Authentication & Security

### Password Hashing with Werkzeug

**Registration - Hash Password:**
```python
from werkzeug.security import generate_password_hash, check_password_hash

# During registration
hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
new_user = User(username=username, email=email, password=hashed_password)
```

**Login - Verify Password:**
```python
user = User.query.filter_by(username=username).first()

if user:
    if check_password_hash(user.password, password):
        session['user_id'] = user.id
        return redirect(url_for('dashboard'))
```

**Interview Question**: *Why never store plain text passwords?*
- **Answer**: Security breach would expose all user passwords. Hashing is one-way encryption - you can verify but can't decrypt. PBKDF2 adds salt to prevent rainbow table attacks.

### Session Management

```python
# Set session
session['user_id'] = user.id

# Check session
if 'user_id' not in session:
    flash('Please login to access this page.', 'warning')
    return redirect(url_for('login'))

# Clear session (logout)
session.pop('user_id', None)
```

### Security Best Practices in IRMS:

1. **Secret Key**: `app.secret_key = os.getenv("SECRET_KEY")`
2. **Input Sanitization**: `.strip()` on user inputs
3. **SQL Injection Protection**: SQLAlchemy ORM automatically escapes inputs
4. **Session-based Auth**: Check `user_id` in session before accessing protected routes

---

## 5. Email Integration

### Flask-Mail Configuration

```python
from flask_mail import Mail, Message

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)
```

### Custom Email Function (SMTP)

**IRMS Implementation:**
```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(to_email, subject, body):
    sender_email = 'aditya.purushottam.kvs@gmail.com'
    app_password = 'aksw lipm smiq ohlr'  # App-specific password
    
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))
    
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure connection
            server.login(sender_email, app_password)
            server.sendmail(sender_email, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
```

### Use Cases in IRMS:

1. **Registration Confirmation**
2. **Login Notification**
3. **Incident Reported**
4. **Response Received**

**Example - Incident Reported Email:**
```python
send_email(
    user.email,
    f"{user.username} Incident Reported at {datetime.datetime.now().strftime('%H:%M %d/%m/%Y')}",
    f"""
    Hello {user.username},

    Thank you for reporting the incident. Below are the details:

    Title: {title}
    Description: {description}
    Status: pending

    We will review it shortly.

    Best regards,
    Incident Response Team
    """
)
```

**Interview Question**: *What's the difference between TLS and SSL?*
- **Answer**: TLS (Transport Layer Security) is the successor to SSL. `starttls()` upgrades an existing connection to encrypted. Port 587 uses STARTTLS, while port 465 uses SSL/TLS from the start.

---

## 6. Frontend-Backend Connectivity

### Template Rendering (Jinja2)

**Basic Route with Template:**
```python
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please login to access this page.', 'warning')
        return redirect(url_for('index'))
    
    incidents = Incident.query.all()
    return render_template('dashboard.html', incidents=incidents)
```

**Jinja2 in Templates:**
```html
<!-- dashboard.html -->
{% for incident in incidents %}
    <div class="incident-card">
        <h3>{{ incident.title }}</h3>
        <p>{{ incident.description }}</p>
        <span>Status: {{ incident.status }}</span>
    </div>
{% endfor %}
```

### Form Handling

**POST Request:**
```python
@app.route('/incident-report', methods=['GET', 'POST'])
def incident_report():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        user_id = session['user_id']
        
        new_incident = Incident(title=title, description=description, user_id=user_id)
        db.session.add(new_incident)
        db.session.commit()
        
        flash('Incident reported successfully!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('incident-report.html')
```

**HTML Form:**
```html
<form method="POST" action="/incident-report">
    <input type="text" name="title" required>
    <textarea name="description" required></textarea>
    <button type="submit">Report Incident</button>
</form>
```

### Flash Messages

```python
from flask import flash

# In route
flash('Registration successful! Please login.', 'success')
flash('Passwords do not match!', 'danger')

# In template
{% with messages = get_flashed_messages(with_categories=true) %}
    {% if messages %}
        {% for category, message in messages %}
            <div class="alert alert-{{ category }}">{{ message }}</div>
        {% endfor %}
    {% endif %}
{% endwith %}
```

### AJAX Integration

**JavaScript Fetch API (from logout.js):**
```javascript
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    
    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        
        try {
            const response = await fetch("/logout", {
                method: "GET",
            });
            
            if (!response.ok) {
                throw new Error("Failed to logout.");
            }
            
            const data = await response.json();
            window.location.href = "/"; // Redirect
        } catch (error) {
            console.error("Error logging out:", error);
        }
    });
});
```

**Flask Backend:**
```python
@app.route('/logout')
def logout():
    try:
        session.pop('user_id', None)
        flash('Logged out successfully.', 'info')
        return jsonify({"message": "Logged out successfully."}), 200
    except Exception as e:
        app.logger.error(f"Error logging out: {str(e)}")
        return jsonify({"error": "Failed to logout."}), 500
```

**Interview Question**: *What's the difference between `render_template()` and `jsonify()`?*
- **Answer**: 
  - `render_template()` returns HTML pages (for browser rendering)
  - `jsonify()` returns JSON data (for API responses, AJAX calls)

---

## 7. RESTful API Design

### REST API Endpoints in IRMS

**1. Get User's Incidents:**
```python
@app.route('/api/incidents')
def get_incidents():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401
    
    incidents = Incident.query.filter_by(user_id=session['user_id']).all()
    
    # Serialize to JSON
    incidents_data = [
        {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status,
            "user_id": incident.user_id,
            "user_email": incident.user_email,
            "incident_id": incident.incident_id,
            "created_at": incident.created_at,
        }
        for incident in incidents
    ]
    
    return jsonify(incidents_data)
```

**2. Get Public Incidents (excluding user's own):**
```python
@app.route('/api/publicIncidents')
def get_publicIncidents():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401
    
    current_user_id = session['user_id']
    incidents = Incident.query.filter(Incident.user_id != current_user_id).all()
    
    incidents_data = [
        {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status,
            "user_id": incident.user_id,
            "user_email": incident.user_email,
            "incident_id": incident.incident_id,
            "created_at": incident.created_at,
        }
        for incident in incidents
    ]
    
    return jsonify(incidents_data)
```

**3. Get Responses by Incident ID:**
```python
@app.route('/api/responses/<incident_id>')
def get_responses_by_incident_id(incident_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401
    
    try:
        responses = Response.query.filter_by(incident_id=incident_id).all()
        
        response_data = [
            {
                "responder_username": response.responder_username,
                "description": response.description,
                "created_at": response.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            }
            for response in responses
        ]
        
        return jsonify({"responses": response_data})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### REST Principles Applied:

1. **Resource-based URLs**: `/api/incidents`, `/api/responses/<id>`
2. **HTTP Methods**: GET for retrieval, POST for creation
3. **Status Codes**: 200 (success), 401 (unauthorized), 500 (error)
4. **JSON Format**: Consistent response structure
5. **Stateless**: Uses session for authentication

**Interview Question**: *What are HTTP status codes you used?*
- **200**: Success
- **401**: Unauthorized (not logged in)
- **404**: Not found (custom error handler)
- **500**: Internal server error

---

## 8. Database Migrations

### Flask-Migrate (Alembic wrapper)

**Setup:**
```python
from flask_migrate import Migrate

migrate = Migrate(app, db)
```

**Migration Commands:**
```bash
# Initialize migrations (first time only)
flask db init

# Create a migration (after model changes)
flask db migrate -m "Add new column to User table"

# Apply migrations to database
flask db upgrade

# Rollback migration
flask db downgrade

# Show migration history
flask db history
```

### Migration Files Structure:
```
migrations/
├── alembic.ini          # Alembic configuration
├── env.py               # Migration environment
├── script.py.mako       # Migration template
├── README
└── versions/            # Migration scripts
    └── xxxx_initial.py
```

**Interview Question**: *Why use migrations instead of db.create_all()?*
- **Answer**: 
  - Migrations track schema changes over time
  - Enable rollback to previous states
  - Safe for production (preserves data)
  - Team collaboration (version control)
  - `db.create_all()` only works on empty databases

---

## 9. Session Management

### How Flask Sessions Work

**Behind the Scenes:**
1. Flask serializes session data
2. Signs it with `SECRET_KEY`
3. Stores in browser cookie (encrypted)
4. Verifies signature on each request

**Implementation in IRMS:**

```python
# Configuration
app.secret_key = os.getenv("SECRET_KEY")

# Setting session data
@app.route('/login', methods=['POST'])
def login():
    # ... authentication logic
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id  # Store in session
        return redirect(url_for('dashboard'))

# Accessing session data
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please login to access this page.', 'warning')
        return redirect(url_for('index'))
    
    # User is authenticated, proceed
    incidents = Incident.query.all()
    return render_template('dashboard.html', incidents=incidents)

# Clearing session
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Logged out successfully.', 'info')
    return jsonify({"message": "Logged out successfully."}), 200
```

### Session Security Best Practices:

1. **Strong Secret Key**: Random, long, kept secret
2. **HTTPS Only**: Prevents cookie theft
3. **HttpOnly Flag**: Prevents XSS attacks
4. **SameSite**: Prevents CSRF attacks

**Advanced Configuration:**
```python
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
```

**Interview Question**: *What's the difference between Flask sessions and database sessions?*
- **Answer**:
  - **Flask sessions**: Store data in encrypted browser cookies (client-side)
  - **Database sessions** (`db.session`): Manage database transactions (server-side)

---

## 10. Error Handling

### Custom Error Pages

**404 Handler in IRMS:**
```python
@app.errorhandler(404)
def page_not_found(e):
    is_logged_in = 'user_id' in session
    return render_template('404.html', is_logged_in=is_logged_in), 404
```

### Exception Handling in Routes

```python
@app.route('/incident-report', methods=['POST'])
def incident_report():
    try:
        # Database operation
        db.session.add(new_incident)
        db.session.commit()
        flash('Incident reported successfully!', 'success')
        return redirect(url_for('dashboard'))
    except Exception as e:
        flash(f'Failed to report incident: {str(e)}', 'danger')
        app.logger.error(f"Error reporting incident: {str(e)}")
        return redirect(url_for('incident_report'))
```

### Logging

```python
import logging

# Basic configuration
logging.basicConfig(level=logging.DEBUG)

# In route
app.logger.error(f"Error submitting response: {str(e)}")
app.logger.info(f"User {user_id} logged in")
app.logger.debug(f"Session data: {session}")
```

**Interview Question**: *What error handlers can you create?*
- **Answer**: `400, 401, 403, 404, 500, 503` or any HTTP status code. Also custom exception classes.

---

## 11. Environment Configuration

### Using python-dotenv

**`.env` file structure:**
```env
# Database Configuration
DB_USERNAME='root'
DB_PASSWORD='root'
DB_HOST='localhost'
DB_NAME='dbmsproject'

# Secret Key for Flask Session
SECRET_KEY='your-secret-key-here'

# Mail Configuration
MAIL_USERNAME='your_email@gmail.com'
MAIL_PASSWORD='your_email_password'

# SMTP Configuration
SMTP_USERNAME='aditya.purushottam.kvs@gmail.com'
SMTP_PASSWORD='app-specific-password'

# Other Configuration
DEBUG=True
```

**Loading in Flask:**
```python
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file

# Access variables
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
```

### Configuration Classes (Advanced)

```python
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
```

**Interview Question**: *Why not hardcode configuration?*
- **Answer**: 
  - Security (keep secrets out of code)
  - Flexibility (different configs for dev/prod)
  - Team collaboration (everyone has own .env)
  - `.env` is in `.gitignore` (not committed)

---

## 12. CI/CD with GitHub Actions

### Dependency Review Workflow

**File: `.github/workflows/dependency-review.yml`**
```yaml
name: 'Dependency review'
on:
  pull_request:
    branches: [ "main" ]

permissions:
  contents: read
  pull-requests: write

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout repository'
        uses: actions/checkout@v4
      
      - name: 'Dependency Review'
        uses: actions/dependency-review-action@v4
        with:
          comment-summary-in-pr: always
```

### What This Workflow Does:

1. **Triggers**: On pull requests to `main` branch
2. **Checks**: Scans dependencies for vulnerabilities
3. **Reports**: Comments on PR with security findings
4. **Prevents**: Merging PRs with known vulnerabilities

### Common CI/CD Pipeline Steps:

```yaml
# Testing workflow (example)
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          pytest tests/
      
      - name: Check code style
        run: |
          flake8 app.py
```

**Interview Question**: *What is CI/CD?*
- **Answer**:
  - **CI (Continuous Integration)**: Automatically test code on every commit/PR
  - **CD (Continuous Deployment)**: Automatically deploy to production after tests pass
  - **Benefits**: Catch bugs early, faster releases, consistent quality

---

## 13. Production Deployment

### Vercel Configuration

**File: `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python",
      "config": {
        "runtime": "python3.11.9"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

### Deployment Checklist:

1. **Environment Variables**: Set in Vercel dashboard
   - `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`
   - `SECRET_KEY`
   - `MAIL_USERNAME`, `MAIL_PASSWORD`

2. **Database**: Use cloud provider (Railway, PlanetScale)

3. **Debug Mode**: Set `DEBUG=False` in production

4. **Requirements**: Ensure all dependencies in `requirements.txt`

5. **Static Files**: Properly referenced in templates

### Production Best Practices:

```python
# Don't do this in production
if __name__ == '__main__':
    app.run(debug=True)  # NEVER in production

# Better approach
if __name__ == '__main__':
    app.run(debug=os.getenv('DEBUG', 'False') == 'True')
```

### WSGI Server (Gunicorn)

For non-serverless deployments:

```bash
# Install
pip install gunicorn

# Run
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

**Interview Question**: *Why not use Flask's built-in server in production?*
- **Answer**: 
  - Flask's server is single-threaded (slow)
  - Not designed for security
  - Can't handle multiple requests efficiently
  - Production servers (Gunicorn, uWSGI) are multi-process, secure, optimized

---

## 14. Common Interview Questions

### Q1: Explain the request-response cycle in Flask
**Answer:**
1. Client sends HTTP request
2. Flask receives request, matches URL to route
3. Route function executes (query DB, process data)
4. Function returns response (HTML template or JSON)
5. Flask sends HTTP response to client

### Q2: What are Flask Blueprints?
**Answer:** 
Blueprints organize large applications into modules. Instead of one big `app.py`, you split into:
```python
# auth/routes.py
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login():
    pass

# In app.py
app.register_blueprint(auth_bp, url_prefix='/auth')
```

### Q3: How do you handle file uploads in Flask?
**Answer:**
```python
from werkzeug.utils import secure_filename

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'No file', 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    file.save(os.path.join('uploads', filename))
    return 'File uploaded', 200
```

### Q4: Explain middleware in Flask
**Answer:**
Functions that run before/after each request:
```python
@app.before_request
def before_request():
    # Check if user is authenticated
    if 'user_id' not in session and request.endpoint != 'login':
        return redirect(url_for('login'))

@app.after_request
def after_request(response):
    # Add security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
```

### Q5: How do you test Flask applications?
**Answer:**
```python
import unittest

class TestIRMS(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
    
    def test_home_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
    
    def test_login(self):
        response = self.client.post('/login', data={
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertEqual(response.status_code, 302)  # Redirect
```

### Q6: What are context processors?
**Answer:**
Make variables available to all templates:
```python
@app.context_processor
def inject_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return dict(current_user=user)
    return dict(current_user=None)

# Now in any template
{{ current_user.username }}
```

### Q7: How do you prevent SQL injection in Flask?
**Answer:**
- Use SQLAlchemy ORM (automatically escapes inputs)
- Never concatenate SQL strings with user input
- Use parameterized queries if writing raw SQL

```python
# BAD
query = f"SELECT * FROM users WHERE username = '{username}'"

# GOOD
user = User.query.filter_by(username=username).first()
```

### Q8: Explain CORS and how to handle it
**Answer:**
Cross-Origin Resource Sharing allows APIs to be accessed from different domains:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins

# Or specific origins
CORS(app, resources={r"/api/*": {"origins": "https://example.com"}})
```

### Q9: How do you optimize Flask applications?
**Answer:**
1. **Caching**: Use Flask-Caching
2. **Database**: Connection pooling, indexes
3. **Static files**: CDN, compression
4. **Pagination**: Don't load all records
5. **Async tasks**: Use Celery for heavy operations

```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/expensive')
@cache.cached(timeout=300)  # Cache for 5 minutes
def expensive_operation():
    # Heavy computation
    return result
```

### Q10: What's the difference between Flask and FastAPI?
**Answer:**
- **Flask**: Mature, flexible, synchronous, large ecosystem
- **FastAPI**: Modern, faster, asynchronous, auto API docs
- **Use Flask for**: Traditional web apps, templates
- **Use FastAPI for**: High-performance APIs, async operations

---

## Key Takeaways for Interview

### Architecture Decisions in IRMS:
1. **Monolithic structure**: All code in `app.py` (good for small apps)
2. **Session-based auth**: Simple, server-managed sessions
3. **ORM over raw SQL**: SQLAlchemy for safety and ease
4. **Template rendering**: Jinja2 for server-side rendering
5. **API endpoints**: RESTful design for frontend consumption
6. **Email notifications**: Real-time user engagement
7. **Cloud deployment**: Serverless (Vercel) + Cloud DB (Railway)

### Technical Skills Demonstrated:
- ✅ Flask framework fundamentals
- ✅ Database design and relationships
- ✅ Authentication and security
- ✅ RESTful API development
- ✅ Frontend-backend integration
- ✅ Email service integration
- ✅ Session management
- ✅ Error handling
- ✅ Environment configuration
- ✅ Database migrations
- ✅ CI/CD pipelines
- ✅ Cloud deployment

### Interview Strategy:
1. **Start with the basics**: Explain what Flask is
2. **Reference your project**: "In my IRMS project, I implemented..."
3. **Explain decisions**: "I chose SQLAlchemy because..."
4. **Show problem-solving**: "When users couldn't login, I debugged by..."
5. **Discuss scaling**: "For production, I would add caching/load balancing..."

---

## Additional Resources

- **Flask Documentation**: https://flask.palletsprojects.com/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Flask Mega-Tutorial**: https://blog.miguelgrinberg.com/
- **Real Python Flask**: https://realpython.com/tutorials/flask/

---

**Good Luck with Your Interview!** 🚀

Remember: Interviewers want to see you **understand concepts**, **explain decisions**, and **solve problems**. Use your IRMS project as proof of practical experience!
