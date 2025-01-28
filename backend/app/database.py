import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")  # Ensure this is set in your .env file

# Create a connection pool
pool = SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=DATABASE_URL,
)

def get_db_connection():
    """Get a connection from the pool."""
    return pool.getconn()

def release_db_connection(conn):
    """Release a connection back to the pool."""
    pool.putconn(conn)

def get_cursor():
    """Provide a cursor for each request."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        yield cursor
    finally:
        cursor.close()
        release_db_connection(conn)
