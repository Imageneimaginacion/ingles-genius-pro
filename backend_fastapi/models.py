from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, Float, DateTime, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    age = Column(Integer, nullable=True)
    avatar = Column(String, nullable=True)
    theme = Column(String, default="default")
    inventory = Column(String, default="[]") # JSON list of item IDs
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Onboarding Data
    english_level = Column(String, nullable=True)
    motivation = Column(String, nullable=True)
    daily_goal_min = Column(Integer, default=10)
    active_badge = Column(String, nullable=True)
    
    # Relationships
    stats = relationship("UserStats", back_populates="user", uselist=False)
    mission_progress = relationship("UserMissionProgress", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    
    # Legacy/Compatibility (optional if we fully migrate, but keeping for safety)
    progress = relationship("UserProgress", back_populates="user", uselist=False)

class UserProgress(Base):
    """Legacy JSON blob storage for backward compatibility during migration"""
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    json_data = Column(JSON, default={})
    unlocked_level_index = Column(Integer, default=0)

    user = relationship("User", back_populates="progress")

class UserStats(Base):
    __tablename__ = "user_stats"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    credits = Column(Integer, default=0)
    xp_total = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)
    
    user = relationship("User", back_populates="stats")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    level = Column(String) # A1, A2, B1...
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    tracks = relationship("Track", back_populates="course", order_by="Track.order_index")

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    key = Column(String) # vocabulary, grammar, listening, speaking
    title = Column(String)
    color = Column(String, nullable=True)
    order_index = Column(Integer, default=0)
    
    course = relationship("Course", back_populates="tracks")
    missions = relationship("Mission", back_populates="track", order_by="Mission.order_index")

class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    track_id = Column(Integer, ForeignKey("tracks.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    duration_min = Column(Integer, default=5)
    xp = Column(Integer, default=10)
    order_index = Column(Integer, default=0)
    
    track = relationship("Track", back_populates="missions")
    sections = relationship("MissionSection", back_populates="mission", order_by="MissionSection.order_index")

class MissionSection(Base):
    __tablename__ = "mission_sections"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    key = Column(String) # objective, vocabulary, quiz, audio, speaking...
    title = Column(String)
    order_index = Column(Integer, default=0)
    payload_json = Column(JSON) # The actual content
    
    mission = relationship("Mission", back_populates="sections")

class UserMissionProgress(Base):
    __tablename__ = "user_mission_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mission_id = Column(Integer, ForeignKey("missions.id"))
    status = Column(String, default="locked") # locked, unlocked, completed
    score = Column(Float, default=0.0)
    xp_earned = Column(Integer, default=0)
    attempts = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="mission_progress")

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String) # "Inglés Básico", etc.
    level = Column(String) # A1, B1, etc.
    date_awarded = Column(String) # Storing as string for simplicity in this legacy setup, or Date
    
    user = relationship("User", back_populates="certificates")

class VocabularyItem(Base):
    __tablename__ = "vocabulary_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    word = Column(String, index=True)
    translation = Column(String)
    example = Column(String, nullable=True)
    
    # SM-2 Algorithm Fields
    next_review = Column(Float, default=0.0) # Timestamp
    interval = Column(Integer, default=1) # Days
    ease_factor = Column(Float, default=2.5)
    streak = Column(Integer, default=0)
    
    user = relationship("User", back_populates="vocabulary")

# Modify User to include relationship
User.vocabulary = relationship("VocabularyItem", back_populates="user")
