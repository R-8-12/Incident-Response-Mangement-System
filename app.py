from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    jsonify,
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import os
from dotenv import load_dotenv
from flask_migrate import Migrate

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# MySQL configuration
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
hostname = os.getenv("DB_HOST")
database_name = os.getenv("DB_NAME")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+mysqlconnector://{username}:{password}@{hostname}/{database_name}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Mail configuration
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT"))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS") == "True"
app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL") == "True"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

db = SQLAlchemy(app)
mail = Mail(app)
migrate = Migrate(app, db)


# Define User and Incident models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)


class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="Reported")
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user_email = db.Column(db.String(150), nullable=False)
    response = db.Column(db.Text, nullable=True)  # Add this line

    def __init__(self, title, description, user_id):
        self.title = title
        self.description = description
        self.user_id = user_id
        self.user_email = User.query.filter_by(id=user_id).first().email
        self.response = None  # Initialize with None


# HOME PAGE
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        user = User.query.filter_by(username=username).first()

        if user:
            if check_password_hash(user.password, password):
                session["user_id"] = user.id
                flash("Logged in successfully!", "success")
                return redirect(url_for("dashboard"))
            else:
                flash("Wrong password. Please try again.", "danger")
        else:
            flash("Username does not exist. Please register.", "danger")

    return render_template("loginForm1.html")


# DASHBOARD
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        flash("Please login to access this page.", "warning")
        return redirect(url_for("home"))

    incidents = Incident.query.all()
    return render_template("dashboard.html", incidents=incidents)


@app.route("/report", methods=["GET", "POST"])
def report():
    if "user_id" not in session:
        flash("Please login to access this page.", "warning")
        return redirect(url_for("home"))

    if request.method == "POST":
        title = request.form["title"]
        description = request.form["description"]
        user_id = session["user_id"]
        incident = Incident(title=title, description=description, user_id=user_id)
        db.session.add(incident)
        db.session.commit()
        flash("Incident reported successfully!", "success")
        return redirect(url_for("dashboard"))

    return render_template("report.html")


# LOGOUT
@app.route("/logout")
def logout():
    session.pop("user_id", None)
    flash("Logged out successfully.", "info")
    return redirect(url_for("home"))


# REGISTRATION
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        if password != confirm_password:
            flash("Passwords do not match!", "danger")
            return redirect(url_for("register"))

        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
        new_user = User(username=username, email=email, password=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            flash("Registration successful! Please login.", "success")
            return redirect(url_for("login"))
        except:
            flash("User already exists.", "danger")
            return redirect(url_for("register"))

    return render_template("registrationForm1.html")


# FORGOT PASSWORD
@app.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form["email"]
        user = User.query.filter_by(email=email).first()

        if user:
            token = os.urandom(24).hex()
            reset_url = url_for("reset_password", token=token, _external=True)
            msg = Message(
                "Password Reset Request",
                sender=os.getenv("MAIL_USERNAME"),
                recipients=[email],
            )
            msg.body = f"Click the link to reset your password: {reset_url}"
            mail.send(msg)

            flash("Password reset link sent to your email.", "info")
        else:
            flash("Email not found. Please register.", "warning")

        return redirect(url_for("home"))
    else:
        return render_template("forget_password.html")


# RESET PASSWORD
@app.route("/reset_password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if request.method == "POST":
        new_password = request.form["password"]
        hashed_password = generate_password_hash(new_password, method="sha256")
        # You need a way to map the token to the user and update the password
        # This part requires a token-to-user mapping mechanism.
        flash("Password reset successful! Please login.", "success")
        return redirect(url_for("home"))

    return render_template("reset_password.html", token=token)


# 404
@app.errorhandler(404)
def page_not_found(e):
    is_logged_in = "user_id" in session
    return render_template("404.html", is_logged_in=is_logged_in), 404


@app.route("/incident-report", methods=["GET", "POST"])
def incident_report():
    if "user_id" not in session:
        flash("Please login to access this page.", "warning")
        return redirect(url_for("login"))

    if request.method == "POST":
        title = request.form["title"]
        description = request.form["description"]
        user_id = session["user_id"]

        new_incident = Incident(title=title, description=description, user_id=user_id)

        try:
            db.session.add(new_incident)
            db.session.commit()
            flash("Incident reported successfully!", "success")
            return redirect(url_for("dashboard"))
        except Exception as e:
            flash(f"Failed to report incident: {str(e)}", "danger")

    return render_template("incident-report.html")


# response page
@app.route("/response")
def response():
    if "user_id" not in session:
        flash("Please login to access this page.", "warning")
        return redirect(url_for("home"))
    return render_template("response.html")


# JSON:dynamic Card
@app.route("/api/incidents")
def get_incidents():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    incidents = Incident.query.filter_by(user_id=session["user_id"]).all()
    incidents_data = [
        {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status,
            "user_id": incident.user_id,
            "user_email": incident.user_email,
        }
        for incident in incidents
    ]
    return jsonify(incidents_data)


# response submission
@app.route("/submit-response", methods=["POST"])
def submit_response():
    incident_id = request.form.get("incident_id")
    response_text = request.form.get("response")

    if not incident_id or not response_text:
        flash("Incident ID and response text are required.", "danger")
        return redirect(url_for("response"))

    incident = Incident.query.get(incident_id)
    if not incident:
        flash("Incident not found.", "danger")
        return redirect(url_for("response"))

    incident.response = response_text
    db.session.commit()
    flash("Response submitted successfully!", "success")  # Add flash message here
    return redirect(url_for("dashboard"))


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
