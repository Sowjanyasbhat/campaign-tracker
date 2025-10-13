# Campaign Tracker

## Overview
A simple full-stack web app to manage marketing campaigns. Users can:  
- Login (hardcoded credentials)  
- Add, view, update, delete campaigns  
- Search/filter campaigns  
- View dashboard summary (Total, Active, Paused, Completed)  

**Backend:** Flask + MongoDB  
**Frontend:** HTML, CSS, JavaScript  

---

## Features
- **Login system:** Username: admin, Password: password123  
- **Add Campaign:** Campaign Name, Client Name, Start Date, Status  
- **View Campaigns:** Table display of campaigns  
- **Update Status:** Change Active / Paused / Completed  
- **Delete Campaign:** Remove campaigns with confirmation  
- **Search & Filter:** Filter by name, client, or status  
- **Dashboard:** Real-time totals for all statuses  
- **Responsive UI:** Works on desktop & mobile  

---

## Backend Setup

### 1. Navigate to the `backend/` folder:

cd backend

### 2. Create a virtual environment (if not already created):

python -m venv venv

### 3. Activate the virtual environment:

Windows (PowerShell):

.\venv\Scripts\Activate


Linux/Mac:

source venv/bin/activate


### 4. Install dependencies:

pip install -r requirements.txt


### 5. Start MongoDB locally or set MONGODB_URI for a remote database:

export MONGODB_URI="your_mongodb_connection_string"


### 6. Run the Flask server:

python app.py


Backend API will be available at: http://localhost:5000/api


## Frontend Setup

1. Navigate to the frontend/ folder.

2. Open index.html in a browser.

3. Login with:
   Username: admin
   Password: password123

Start adding and managing campaigns.
