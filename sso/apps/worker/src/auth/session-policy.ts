export function capSessionExpiration(
  proposedExpiresAt: Date,
  absoluteExpiresAt: Date,
): Date {
  return proposedExpiresAt <= absoluteExpiresAt
    ? proposedExpiresAt
    : absoluteExpiresAt;
}
