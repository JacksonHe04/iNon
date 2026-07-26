UPDATE "oauthClient"
SET
  "redirectUris" = json_array(
    CASE json_extract("metadata", '$.project')
      WHEN 'inon' THEN 'https://inon.space/api/auth/inon/callback'
      WHEN 'leaf' THEN 'https://leaf.inon.space/api/auth/inon/callback'
      WHEN 'pine' THEN 'https://pine.inon.space/api/auth/inon/callback'
      WHEN 'sayless' THEN 'https://sayless.inon.space/api/auth/inon/callback'
      WHEN 'treez' THEN 'https://treez.inon.space/api/auth/inon/callback'
    END,
    'http://localhost:3000/api/auth/inon/callback'
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE json_extract("metadata", '$.project')
  IN ('inon', 'leaf', 'pine', 'sayless', 'treez');
