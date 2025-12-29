import sqlite3
import os

# Adjust path if running from root
DB_FILE = os.path.join(os.path.dirname(__file__), "sql_app.db")

def migrate():
    if not os.path.exists(DB_FILE):
        print(f"Database {DB_FILE} not found. Checking current dir...")
        DB_FILE_LOCAL = "sql_app.db"
        if os.path.exists(DB_FILE_LOCAL):
             DB_FILE_ADJUSTED = DB_FILE_LOCAL
        else:
             print("DB not found.")
             return
    else:
        DB_FILE_ADJUSTED = DB_FILE

    print(f"Migrating {DB_FILE_ADJUSTED}...")
    conn = sqlite3.connect(DB_FILE_ADJUSTED)
    cursor = conn.cursor()

    try:
        # Add active_badge column
        cursor.execute("ALTER TABLE users ADD COLUMN active_badge VARCHAR")
        print("Added active_badge column to users table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column active_badge already exists.")
        else:
            print(f"Error adding column: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
