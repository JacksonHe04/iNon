UPDATE "oauthClient"
SET
  "redirectUris" = json_array(
    'https://sayless.inon.space/api/auth/inon/callback',
    'http://localhost:3000/api/auth/inon/callback'
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE json_extract("metadata", '$.project') = 'sayless';
