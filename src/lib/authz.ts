/**
 * Guards a resource's owning user against the current requester. Used to
 * enforce that only the owner can mutate a clip or offer.
 */
export function isOwner(
  ownerId: string | null | undefined,
  requesterId: string | null | undefined,
): boolean {
  return Boolean(ownerId && requesterId && ownerId === requesterId);
}
