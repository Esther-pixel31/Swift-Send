CASHIE - Project Setup Instructions
===================================

🚀 Getting Started

🖥️ Prerequisites:
-----------------
- Python 3.8+
- Node.js 18+
- PostgreSQL 14+
- WSL (for Windows users)

-----------------------------------
⚙️ Backend Setup (Flask + PostgreSQL)
-----------------------------------

1. Clone the repo and navigate to the backend folder:
   ```bash 
   git clone https://github.com/your-org/cashie.git
   cd cashie/Backend
   ```

2. Create and activate a virtual environment:
    
   python3 -m venv venv
   source venv/bin/activate

3. Install Python dependencies:
   pip install -r requirements.txt

4. Start PostgreSQL manually:
   sudo service postgresql start

5. Create and configure the .env file:
   cp .env.example .env
   # Update database credentials inside .env

6. Run database migrations (if any):
   flask db upgrade

7. Start the Flask development server:
   flask run

----------------------------------------
🖼️ Frontend Setup (React + Vite + Tailwind)
----------------------------------------

1. Navigate to the frontend folder:
   cd ../frontend

2. Install dependencies:
   npm install

3. Start the Vite dev server:
   npm run dev

----------------------------------------
💡 Notes:
----------------------------------------
- Remember to manually start PostgreSQL before backend use:
  sudo service postgresql start

- Use your virtual environment each time you start backend work:
  source venv/bin/activate

- This project uses:
  - Flask + PostgreSQL (backend)
  - React + Vite + TailwindCSS (frontend)

