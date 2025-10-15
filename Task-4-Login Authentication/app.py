from flask import Flask, render_template, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "super_secret_key"  # Change this to a strong secret key
users = {}

@app.route('/')
def home():
    return render_template('home.html')  # Home page with login and register links

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])
        
        # Store user details in dictionary (for simplicity)
        users[username] = {'email': email, 'password': password}
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None  # Initialize error as None
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if user exists and if the password matches
        user = users.get(username)
        if user and check_password_hash(user['password'], password):
            session['username'] = username
            return render_template('dashboard.html')
        else:
            error = "Invalid credentials. Please try again."  # Set error message
    
    # Render the login page with any error message
    return render_template('login.html', error=error)


@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return f"Welcome to the dashboard, {session['username']}!"
    else:
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True)
