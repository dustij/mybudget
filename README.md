# MyBudget

MyBudget is a personal budgeting app that implements recurring rules and provides a running balance.

This project is for anyone who wants to keep track of their personal finances and create a budget.

## Table of Contents

- [Installation](#installation)

## Installation

To install and set up MyBudget, follow these steps:

Clone the repository to your local machine.

```
git clone https://github.com/dustij/mybudget.git
cd mybudget
```

### Backend Setup

Use Pipenv to install the Python dependencies from the Pipfile.

```bash
pipenv install
```

Activate the Virtual Environment:

You should activate the virtual environment to work within the project's environment.

```bash
pipenv shell
```

Run Migrations:

Navigate to the backend directory.

```bash
cd backend
```

Apply the database migrations to create the necessary tables in the database.

```bash
python manage.py migrate
```

Start the Django Server:

Start the Django development server.

```bash
python manage.py runserver
```

### Frontend Setup:

Navigate to the frontend directory and set up the React frontend.

```bash
cd ../frontend
```

a. Install Dependencies:

Use npm or yarn to install the frontend dependencies.

```bash
npm install
```

b. Start the React Development Server:

Start the React development server, which will open the app in your default web browser.

```bash
npm run dev
```

### Access the Application:

You can now access the application in your web browser at:

    Frontend: http://localhost:5173
    Backend API: http://localhost:8000
