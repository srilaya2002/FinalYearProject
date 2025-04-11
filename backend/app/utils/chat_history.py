from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.database import get_cursor, release_db_connection

router = APIRouter()
@router.get("/chat-history")
def get_all_chat_sessions(user: dict = Depends(get_current_user)):
    cursor, conn = get_cursor()
    try:
        cursor.execute(
            """
            SELECT DISTINCT ON (session_id) session_id, user_message, timestamp
            FROM conversation_logs
            WHERE user_id = (SELECT id FROM users WHERE email = %s)
            ORDER BY session_id, timestamp ASC
            """,
            (user["email"],),
        )
        rows = cursor.fetchall()

        sessions = [
            {
                "session_id": row["session_id"],
                "title": row["user_message"],
                "timestamp": row["timestamp"].isoformat()
            }
            for row in rows
        ]
        return {"history": sessions}
    except Exception as e:
        print("❌ Error loading chat history sessions:", e)
        raise HTTPException(status_code=500, detail="Error loading sessions")
    finally:
        release_db_connection(conn)


@router.get("/chat-history/{session_id}")
def get_chat_by_session(session_id: str, user: dict = Depends(get_current_user)):
    cursor, conn = get_cursor()
    try:
        cursor.execute(
            """
            SELECT user_message, ai_response, timestamp
            FROM conversation_logs
            WHERE session_id = %s
              AND user_id = (SELECT id FROM users WHERE email = %s)
            ORDER BY timestamp ASC
            """,
            (session_id, user["email"]),
        )
        rows = cursor.fetchall()
        return {"session": session_id, "messages": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch session chat")
    finally:
        release_db_connection(conn)

