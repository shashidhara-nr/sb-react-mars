/**
 * Permission utilities: check whether a user's authorities grant access.
 * Exports two helpers:
 * - withAuthority: returns true when the user HAS the required authority/authorities
 * - withoutAuthority: returns true when the user DOES NOT have the required authority/authorities
 */

export type Authority = string;
export type AuthorityInput = Authority | Authority[] | Set<Authority> | undefined | null;

export type AuthorityMatch = 'any' | 'all';

export interface AuthorityOptions {
	match?: AuthorityMatch; // 'any' (default) → at least one required authority present; 'all' → all required authorities present
	caseSensitive?: boolean; // default false
}

function normalizeAuthorities(input: AuthorityInput, caseSensitive = false): Set<string> {
	if (!input) return new Set<string>();
	const toKey = (s: string) => (caseSensitive ? s : s.toLowerCase());
	if (input instanceof Set) {
		return new Set(Array.from(input).map((s) => toKey(String(s))));
	}
	if (Array.isArray(input)) {
		return new Set(input.map((s) => toKey(String(s))));
	}
	return new Set([toKey(String(input))]);
}

function hasAuthority(
	userAuthorities: AuthorityInput,
	required: AuthorityInput,
	opts: AuthorityOptions = {},
): boolean {
	const { match = 'any', caseSensitive = false } = opts;
	const userSet = normalizeAuthorities(userAuthorities, caseSensitive);
	const reqSet = normalizeAuthorities(required, caseSensitive);

	if (reqSet.size === 0) return true; // no requirement → grant
	if (userSet.size === 0) return false; // no user authorities → deny

	if (match === 'all') {
		for (const r of reqSet) {
			if (!userSet.has(r)) return false;
		}
		return true;
	}
	// match === 'any'
	for (const r of reqSet) {
		if (userSet.has(r)) return true;
	}
	return false;
}

/**
 * Returns true when the user HAS the required authority/authorities.
 */
export function withAuthority(
	userAuthorities: AuthorityInput,
	required: AuthorityInput,
	opts: AuthorityOptions = {},
): boolean {
	return hasAuthority(userAuthorities, required, opts);
}

/**
 * Returns true when the user DOES NOT have the required authority/authorities.
 */
export function withoutAuthority(
	userAuthorities: AuthorityInput,
	required: AuthorityInput,
	opts: AuthorityOptions = {},
): boolean {
	return !hasAuthority(userAuthorities, required, opts);
}

