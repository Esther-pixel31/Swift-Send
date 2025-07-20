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
   git clone git@github.com:Esther-pixel31/Swift-Send.git
   cd Swift_send
   cd Backend
   ```

2. Create and activate a virtual environment:
    ```bash
   python3 -m venv venv
   source venv/bin/activate
    ```

3. Install Python dependencies:
    ```bash
   pip install -r requirements.txt
    ```
4. Create a new PostgreSQL user with superuser privileges
    ```bash
    sudo -u postgres createuser yourusername --superuser
    ```
    Replace yourusername with your actual Linux/WSL username.

5.  Create a new local database
    ```bash
    createdb -U yourusername cashie_dev
    ```
6.  Setup Environment Variables

    Each collaborator should create a `.env` file in the `Backend/` folder by copying the provided `.env.example`:
    ```bash
    cp .env.example .env
    DB_NAME=cashie_dev
    DB_USER=yourusername
    DB_PASSWORD=yourpassword
    DB_HOST=localhost
    DB_PORT=5432
    ```
7. Start PostgreSQL manually:
    ```bash
   sudo service postgresql start
    ```

8. Run database migrations (if any):
   flask db upgrade

9. Start the Flask development server:
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
  - React + Vite + TailwindCSS + Redux (frontend)

