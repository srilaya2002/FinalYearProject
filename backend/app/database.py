import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ------------------ DATABASE URL ------------------
DATABASE_URL = os.getenv("DATABASE_URL")  # Example: postgresql://user:pass@localhost:5432/nutrimate

# ------------------ Psycopg2 Pool Setup ------------------
pool = SimpleConnectionPool(
    minconn=1,
    maxconn=50,
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
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    return cursor, conn


# ------------------ SQLAlchemy Setup (for table creation) ------------------
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
