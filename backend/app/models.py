from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    level = Column(String, default=None)
    english_level = Column(String, default=None)
    created_at = Column(DateTime, default=datetime.utcnow)
    quiz_attempts = relationship("UserQuizAttempt", back_populates="user")
    homeworks = relationship("Homework", back_populates="user")
    level_test_attempts = relationship("LevelTestAttempt", back_populates="user")

class LevelTestAttempt(Base):
    __tablename__ = "level_test_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level = Column(String, nullable=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="level_test_attempts")
    answers = relationship("LevelTestAnswer", back_populates="attempt")

class LevelTestAnswer(Base):
    __tablename__ = "level_test_answers"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("level_test_attempts.id"), nullable=False)
    question_text = Column(String, nullable=False)
    question_type = Column(String, nullable=False)
    user_answer = Column(String)
    correct_answer = Column(String)
    question_level = Column(String)
    attempt = relationship("LevelTestAttempt", back_populates="answers")

class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    min_level = Column(String, nullable=False)
    lessons = relationship("Lesson", back_populates="module")
    quizzes = relationship("Quiz", back_populates="module")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    content = Column(String, nullable=False)
    order_index = Column(Integer, default=0)
    module = relationship("Module", back_populates="lessons")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    level = Column(String, nullable=False)
    module = relationship("Module", back_populates="quizzes")
    attempts = relationship("UserQuizAttempt", back_populates="quiz")

class UserQuizAttempt(Base):
    __tablename__ = "user_quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Float, default=0.0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("UserAnswer", back_populates="attempt")
    homeworks = relationship("Homework", back_populates="based_on_attempt")

class UserAnswer(Base):
    __tablename__ = "user_answers"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("user_quiz_attempts.id"), nullable=False)
    question_text = Column(String, nullable=False)
    selected_answer = Column(String)
    correct_answer = Column(String)
    is_correct = Column(Boolean, default=False)
    attempt = relationship("UserQuizAttempt", back_populates="answers")

class Homework(Base):
    __tablename__ = "homeworks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    based_on_attempt_id = Column(Integer, ForeignKey("user_quiz_attempts.id"), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="homeworks")
    based_on_attempt = relationship("UserQuizAttempt", back_populates="homeworks")

class Duel(Base):
    __tablename__ = "duels"
    id = Column(Integer, primary_key=True, index=True)
    challenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level = Column(String, nullable=False)
    status = Column(String, default="pending")
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)