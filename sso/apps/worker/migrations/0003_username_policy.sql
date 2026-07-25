CREATE TRIGGER "user_username_policy_update"
BEFORE UPDATE OF "username", "displayUsername", "usernameChangedAt" ON "user"
WHEN NEW."username" IS NOT OLD."username"
BEGIN
  SELECT RAISE(ABORT, 'username cannot be removed')
    WHERE NEW."username" IS NULL;
  SELECT RAISE(ABORT, 'username and display username must match')
    WHERE NEW."displayUsername" IS NOT NEW."username";
  SELECT RAISE(ABORT, 'username change timestamp is required')
    WHERE NEW."usernameChangedAt" IS NULL;
  SELECT RAISE(ABORT, 'username change is cooling down')
    WHERE OLD."username" IS NOT NULL
      AND (
        OLD."usernameChangedAt" IS NULL
        OR unixepoch(NEW."usernameChangedAt")
          < unixepoch(OLD."usernameChangedAt") + 2592000
      );
END;

CREATE TRIGGER "user_username_timestamp_guard"
BEFORE UPDATE OF "usernameChangedAt" ON "user"
WHEN NEW."username" IS OLD."username"
  AND NEW."usernameChangedAt" IS NOT OLD."usernameChangedAt"
BEGIN
  SELECT RAISE(ABORT, 'username timestamp requires a username change');
END;
