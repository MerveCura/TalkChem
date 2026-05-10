from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text, UniqueConstraint
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
    profile_image = Column(String, default=None)
    created_at = Column(DateTime, default=datetime.utcnow)
    quiz_attempts = relationship("UserQuizAttempt", back_populates="user")
    homeworks = relationship("Homework", back_populates="user")
    level_test_attempts = relationship("LevelTestAttempt", back_populates="user")
    tense_quiz_attempts = relationship("TenseQuizAttempt", back_populates="user")
    saved_words = relationship("SavedWord", back_populates="user")
    seen_words = relationship("UserSeenWord", back_populates="user")
    seen_tense_questions = relationship("TenseSeenQuestion", back_populates="user")
    seen_grammar_questions = relationship("GrammarSeenQuestion", back_populates="user")
    sent_friend_requests = relationship("Friendship", foreign_keys="Friendship.requester_id", back_populates="requester")
    received_friend_requests = relationship("Friendship", foreign_keys="Friendship.addressee_id", back_populates="addressee")
    challenged_duels = relationship("Duel", foreign_keys="Duel.challenger_id", back_populates="challenger")
    received_duels = relationship("Duel", foreign_keys="Duel.opponent_id", back_populates="opponent")
    speaking_sessions = relationship("SpeakingSession", back_populates="user")

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

class TenseQuizAttempt(Base):
    __tablename__ = "tense_quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tense_id = Column(String, nullable=False)
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=15)
    completed = Column(Boolean, default=False)
    perfect = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="tense_quiz_attempts")
    answers = relationship("TenseQuizAnswer", back_populates="attempt")

class TenseQuizAnswer(Base):
    __tablename__ = "tense_quiz_answers"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("tense_quiz_attempts.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    options = Column(Text)
    user_answer = Column(String)
    correct_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    ai_feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    attempt = relationship("TenseQuizAttempt", back_populates="answers")

class TenseQuestionPool(Base):
    __tablename__ = "tense_question_pool"
    id = Column(Integer, primary_key=True, index=True)
    tense_id = Column(String, nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    options = Column(Text, nullable=True)
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    seen_by = relationship("TenseSeenQuestion", back_populates="question")

class TenseSeenQuestion(Base):
    __tablename__ = "tense_seen_questions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("tense_question_pool.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="seen_tense_questions")
    question = relationship("TenseQuestionPool", back_populates="seen_by")
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_tense_seen"),)

class VocabularyWord(Base):
    __tablename__ = "vocabulary_words"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)
    level = Column(String, nullable=False, index=True)
    word = Column(String, nullable=False)
    meaning = Column(String, nullable=False)
    meaning_tr = Column(String)
    example_sentence = Column(String, nullable=False)
    pronunciation = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    saved_by = relationship("SavedWord", back_populates="word")
    seen_by = relationship("UserSeenWord", back_populates="word")

class SavedWord(Base):
    __tablename__ = "saved_words"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("vocabulary_words.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="saved_words")
    word = relationship("VocabularyWord", back_populates="saved_by")
    __table_args__ = (UniqueConstraint("user_id", "word_id", name="uq_saved_word"),)

class UserSeenWord(Base):
    __tablename__ = "user_seen_words"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("vocabulary_words.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="seen_words")
    word = relationship("VocabularyWord", back_populates="seen_by")
    __table_args__ = (UniqueConstraint("user_id", "word_id", name="uq_seen_word"),)

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
    quiz_type = Column(String, nullable=False)
    topic_id = Column(String, nullable=False)
    topic_name = Column(String, nullable=False)
    wrong_questions = Column(Text, nullable=False)
    status = Column(String, default="pending")
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="homeworks")

# ── Social Models ─────────────────────────────────────────────────────────────

class Friendship(Base):
    __tablename__ = "friendships"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_friend_requests")
    addressee = relationship("User", foreign_keys=[addressee_id], back_populates="received_friend_requests")
    __table_args__ = (UniqueConstraint("requester_id", "addressee_id", name="uq_friendship"),)

class Duel(Base):
    __tablename__ = "duels"
    id = Column(Integer, primary_key=True, index=True)
    challenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")
    topic = Column(String, nullable=False)
    topic_name = Column(String, nullable=False)
    questions = Column(Text, nullable=True)
    challenger_score = Column(Float, nullable=True)
    opponent_score = Column(Float, nullable=True)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    challenger = relationship("User", foreign_keys=[challenger_id], back_populates="challenged_duels")
    opponent = relationship("User", foreign_keys=[opponent_id], back_populates="received_duels")

# ── Speaking Models ───────────────────────────────────────────────────────────

class SpeakingSession(Base):
    __tablename__ = "speaking_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scenario_id = Column(String, nullable=False)
    scenario_name = Column(String, nullable=False)
    messages = Column(Text, nullable=False)
    overall_score = Column(Float, nullable=True)
    grammar_score = Column(Float, nullable=True)
    vocabulary_score = Column(Float, nullable=True)
    fluency_score = Column(Float, nullable=True)
    pronunciation_score = Column(Float, nullable=True)
    analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="speaking_sessions")

class GrammarQuestionPool(Base):
    __tablename__ = "grammar_question_pool"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(String, nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    options = Column(Text, nullable=True)
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    seen_by = relationship("GrammarSeenQuestion", back_populates="question")

class GrammarSeenQuestion(Base):
    __tablename__ = "grammar_seen_questions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("grammar_question_pool.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="seen_grammar_questions")
    question = relationship("GrammarQuestionPool", back_populates="seen_by")
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_grammar_seen"),)

class GrammarQuizAttempt(Base):
    __tablename__ = "grammar_quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(String, nullable=False)
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=15)
    completed = Column(Boolean, default=False)
    perfect = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    answers = relationship("GrammarQuizAnswer", back_populates="attempt")

class GrammarQuizAnswer(Base):
    __tablename__ = "grammar_quiz_answers"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("grammar_quiz_attempts.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    options = Column(Text)
    user_answer = Column(String)
    correct_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    ai_feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    attempt = relationship("GrammarQuizAttempt", back_populates="answers")