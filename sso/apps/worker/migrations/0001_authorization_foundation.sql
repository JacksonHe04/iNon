CREATE TABLE projects (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id IN ('inon', 'leaf', 'pine', 'sayless', 'treez')),
  project_key TEXT NOT NULL UNIQUE
    CHECK (project_key IN ('inon', 'leaf', 'pine', 'sayless', 'treez')),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled')),
  created_at INTEGER NOT NULL
);

CREATE TABLE project_memberships (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL
    REFERENCES projects(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'admin')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (project_id, user_id)
);

CREATE INDEX project_memberships_user_id_idx
  ON project_memberships(user_id);

CREATE INDEX project_memberships_project_role_idx
  ON project_memberships(project_id, role);

CREATE TABLE global_roles (
  role TEXT PRIMARY KEY NOT NULL
    CHECK (role = 'super_admin'),
  user_id TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  actor_user_id TEXT,
  subject_user_id TEXT,
  project_id TEXT
    REFERENCES projects(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  action TEXT NOT NULL,
  request_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
    CHECK (json_valid(metadata_json)),
  created_at INTEGER NOT NULL
);

CREATE INDEX audit_logs_actor_created_at_idx
  ON audit_logs(actor_user_id, created_at DESC);

CREATE INDEX audit_logs_subject_created_at_idx
  ON audit_logs(subject_user_id, created_at DESC);

CREATE INDEX audit_logs_project_created_at_idx
  ON audit_logs(project_id, created_at DESC);

CREATE TRIGGER audit_logs_prevent_update
BEFORE UPDATE ON audit_logs
BEGIN
  SELECT RAISE(ABORT, 'audit_logs are append-only');
END;

CREATE TRIGGER audit_logs_prevent_delete
BEFORE DELETE ON audit_logs
BEGIN
  SELECT RAISE(ABORT, 'audit_logs are append-only');
END;

INSERT INTO projects (id, project_key, name, status, created_at)
VALUES
  ('inon', 'inon', 'iNon', 'active', 0),
  ('leaf', 'leaf', 'Leaf', 'active', 0),
  ('pine', 'pine', 'PINE', 'active', 0),
  ('sayless', 'sayless', 'SAYLESS', 'active', 0),
  ('treez', 'treez', 'Treez', 'active', 0);
