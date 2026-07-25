CREATE UNIQUE INDEX "oauthClient_first_party_project_unique"
  ON "oauthClient" (json_extract("metadata", '$.project'))
  WHERE json_extract("metadata", '$.project')
    IN ('inon', 'leaf', 'pine', 'sayless', 'treez');

CREATE TRIGGER "oauthClient_first_party_metadata_immutable"
BEFORE UPDATE OF "metadata" ON "oauthClient"
WHEN json_extract(OLD."metadata", '$.project')
  IN ('inon', 'leaf', 'pine', 'sayless', 'treez')
  AND NEW."metadata" IS NOT OLD."metadata"
BEGIN
  SELECT RAISE(ABORT, 'first-party OAuth client project metadata is immutable');
END;
