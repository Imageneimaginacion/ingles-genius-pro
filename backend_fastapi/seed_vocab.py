from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import time

def seed_vocab():
    db = SessionLocal()
    try:
        user = db.query(models.User).first()
        if not user:
            print("No user found to seed.")
            return

        print(f"Seeding vocabulary for user: {user.email}")

        words = [
            {"word": "Hello", "translation": "Hola", "example": "Hello, how are you?"},
            {"word": "World", "translation": "Mundo", "example": "The world is big."},
            {"word": "Computer", "translation": "Computadora", "example": "I use a computer."},
            {"word": "Star", "translation": "Estrella", "example": "Look at the star."},
            {"word": "Ship", "translation": "Nave", "example": "The ship is fast."}
        ]

        for w in words:
            exists = db.query(models.VocabularyItem).filter(
                models.VocabularyItem.user_id == user.id,
                models.VocabularyItem.word == w["word"]
            ).first()

            if not exists:
                new_item = models.VocabularyItem(
                    user_id=user.id,
                    word=w["word"],
                    translation=w["translation"],
                    example=w["example"],
                    next_review=time.time() * 1000, # Due Now
                    interval=1,
                    ease_factor=2.5,
                    streak=0
                )
                db.add(new_item)
                print(f"Added: {w['word']}")
        
        db.commit()
        print("Vocabulary seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_vocab()
