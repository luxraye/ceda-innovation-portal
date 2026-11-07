-- CEDA Innovation Portal - Initial schema
PRAGMA foreign_keys = ON;

-- Users & authentication -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('submitter','evaluator','adjudicator','admin')),
  organisation TEXT,
  phone TEXT,
  district TEXT,
  expertise TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Programme configuration ----------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  strategic_priority TEXT,
  icon TEXT DEFAULT 'fa-lightbulb',
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stage_order INTEGER NOT NULL,
  description TEXT,
  min_evaluators INTEGER NOT NULL DEFAULT 2,
  pass_threshold REAL NOT NULL DEFAULT 60,
  blind_review INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  starts_at DATETIME,
  ends_at DATETIME
);

CREATE TABLE IF NOT EXISTS criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight REAL NOT NULL DEFAULT 1,
  max_score INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_criteria_round ON criteria(round_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Ideas ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  target_beneficiaries TEXT,
  impact TEXT,
  business_model TEXT,
  budget_estimate REAL,
  timeline TEXT,
  team_description TEXT,
  district TEXT,
  tags TEXT,
  category_id INTEGER REFERENCES categories(id),
  submitter_id INTEGER NOT NULL REFERENCES users(id),
  stage TEXT NOT NULL DEFAULT 'draft'
    CHECK (stage IN ('draft','submitted','under_review','revision_requested','approved','awarded','rejected','withdrawn')),
  current_round_id INTEGER REFERENCES rounds(id),
  is_confidential INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  decided_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_ideas_submitter ON ideas(submitter_id);
CREATE INDEX IF NOT EXISTS idx_ideas_stage ON ideas(stage);
CREATE INDEX IF NOT EXISTS idx_ideas_round ON ideas(current_round_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category_id);

CREATE TABLE IF NOT EXISTS idea_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  payload TEXT NOT NULL,
  change_note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_versions_idea ON idea_versions(idea_id);

CREATE TABLE IF NOT EXISTS idea_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT DEFAULT 'link',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS idea_stage_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  round_id INTEGER REFERENCES rounds(id),
  actor_id INTEGER REFERENCES users(id),
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_history_idea ON idea_stage_history(idea_id);

-- Evaluation -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  round_id INTEGER NOT NULL REFERENCES rounds(id),
  evaluator_id INTEGER NOT NULL REFERENCES users(id),
  assigned_by INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','declined')),
  recommendation TEXT CHECK (recommendation IN ('advance','revise','reject')),
  overall_comment TEXT,
  conflict_note TEXT,
  weighted_score REAL,
  due_at DATETIME,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  UNIQUE (idea_id, round_id, evaluator_id)
);
CREATE INDEX IF NOT EXISTS idx_assignments_evaluator ON assignments(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_assignments_idea ON assignments(idea_id);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  criterion_id INTEGER NOT NULL REFERENCES criteria(id),
  score REAL NOT NULL,
  comment TEXT,
  UNIQUE (assignment_id, criterion_id)
);

CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  round_id INTEGER REFERENCES rounds(id),
  decided_by INTEGER NOT NULL REFERENCES users(id),
  decision TEXT NOT NULL CHECK (decision IN ('advance','revise','reject','approve','award')),
  rationale TEXT,
  aggregate_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_decisions_idea ON decisions(idea_id);

-- Feedback / collaboration ---------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'submitter' CHECK (visibility IN ('submitter','internal')),
  parent_id INTEGER REFERENCES feedback(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_feedback_idea ON feedback(idea_id);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  meta TEXT,
  ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
