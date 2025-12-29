import sqlite3
import os

DB_PATH = "sql_app.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print("Database not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("Attempting to add columns...")
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN english_level TEXT")
            print("Added english_level")
        except sqlite3.OperationalError as e:
            print(f"Skipping english_level: {e}")

        try:
            cursor.execute("ALTER TABLE users ADD COLUMN motivation TEXT")
            print("Added motivation")
        except sqlite3.OperationalError as e:
            print(f"Skipping motivation: {e}")

        try:
            cursor.execute("ALTER TABLE users ADD COLUMN daily_goal_min INTEGER DEFAULT 10")
            print("Added daily_goal_min")
        except sqlite3.OperationalError as e:
            print(f"Skipping daily_goal_min: {e}")

        conn.commit()
        print("Migration complete.")
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
