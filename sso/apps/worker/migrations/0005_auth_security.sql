CREATE TABLE "auth_rate_limit_buckets" (
  "bucket_key" TEXT PRIMARY KEY NOT NULL,
  "action" TEXT NOT NULL,
  "subject_kind" TEXT NOT NULL
    CHECK ("subject_kind" IN ('identifier', 'ip', 'user')),
  "subject_digest" TEXT NOT NULL,
  "window_started_at" INTEGER NOT NULL,
  "expires_at" INTEGER NOT NULL,
  "request_count" INTEGER NOT NULL
    CHECK ("request_count" > 0)
);

CREATE INDEX "auth_rate_limit_buckets_expiry_idx"
  ON "auth_rate_limit_buckets" ("expires_at");

CREATE INDEX "auth_rate_limit_buckets_action_subject_idx"
  ON "auth_rate_limit_buckets" (
    "action",
    "subject_kind",
    "subject_digest"
  );
