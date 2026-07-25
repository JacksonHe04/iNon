CREATE TRIGGER "user_username_policy_update"
BEFORE UPDATE OF "username", "displayUsername", "usernameChangedAt" ON "user"
WHEN NEW."username" IS NOT OLD."username"
BEGIN
  SELECT CASE
    WHEN NEW."username" IS NULL
    THEN RAISE(ABORT, 'username cannot be removed')
  END;
  SELECT CASE
    WHEN NEW."displayUsername" IS NOT NEW."username"
    THEN RAISE(ABORT, 'username and display username must match')
  END;
  SELECT CASE
    WHEN NEW."usernameChangedAt" IS NULL
    THEN RAISE(ABORT, 'username change timestamp is required')
  END;
  SELECT CASE
    WHEN OLD."username" IS NOT NULL
      AND (
        OLD."usernameChangedAt" IS NULL
        OR unixepoch(NEW."usernameChangedAt")
          < unixepoch(OLD."usernameChangedAt") + 2592000
      )
    THEN RAISE(ABORT, 'username change is cooling down')
  END;
END;

CREATE TRIGGER "user_username_timestamp_guard"
BEFORE UPDATE OF "usernameChangedAt" ON "user"
WHEN NEW."username" IS OLD."username"
  AND NEW."usernameChangedAt" IS NOT OLD."usernameChangedAt"
BEGIN
  SELECT RAISE(ABORT, 'username timestamp requires a username change');
END;
