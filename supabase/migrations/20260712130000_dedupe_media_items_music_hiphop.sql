-- Deduplicate media_items rows that were duplicated during historical data migration.
--
-- Affected rows: music + hiphop domains, every (profile_id, domain, item_type,
-- name, creator, album, country_or_region, link, comment, image_url) tuple had
-- exactly two identical rows. reading/films domains were not affected.
--
-- Strategy: keep the row with the smallest sort_order per duplicate group; if
-- sort_orders tie, keep the row with the smallest id. Delete the rest.

BEGIN;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY
        profile_id,
        domain,
        item_type,
        name,
        creator,
        album,
        country_or_region,
        link,
        comment,
        COALESCE(image_url, '')
      ORDER BY sort_order ASC, id ASC
    ) AS rn
  FROM media_items
)
DELETE FROM media_items
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

COMMIT;