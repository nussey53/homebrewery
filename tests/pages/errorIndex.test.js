import errorIndex from '../../client/homebrew/pages/errorPage/errors/errorIndex.js';

describe('errorIndex', () => {
	test('returns error messages object', () => {
		const props = {
			brew: {
				brewTitle: 'Test Brew',
				shareId: 'abc123',
				editId: 'edit456',
				brewId: 'brew789',
				authors: ['author1', 'author2'],
				accessType: 'edit'
			}
		};

		const errors = errorIndex(props);
		expect(errors).toBeDefined();
		expect(typeof errors).toBe('object');
	});

	test('returns default error 00', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['00']).toBeDefined();
		expect(errors['00']).toContain('unknown error');
	});

	test('returns error 01 for local deployment configuration error', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['01']).toBeDefined();
		expect(errors['01']).toContain('local Homebrewery storage only');
	});

	test('returns error 02 for unsupported storage', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['02']).toBeDefined();
		expect(errors['02']).toContain('not supported in this');
	});

	test('returns error 03 for unauthorized user with author list', () => {
		const props = {
			brew: {
				brewTitle: 'My Brew',
				shareId: 'share123',
				authors: ['alice', 'bob']
			}
		};
		const errors = errorIndex(props);

		expect(errors['03']).toBeDefined();
		expect(errors['03']).toContain('does not have editor access');
		expect(errors['03']).toContain('alice');
		expect(errors['03']).toContain('bob');
		expect(errors['03']).toContain('share123');
	});

	test('returns error 04 for sign-in required', () => {
		const props = {
			brew: {
				brewTitle: 'Secure Brew',
				shareId: 'share456',
				authors: ['user1']
			}
		};
		const errors = errorIndex(props);

		expect(errors['04']).toBeDefined();
		expect(errors['04']).toContain('Sign-in required');
		expect(errors['04']).toContain('Secure Brew');
	});

	test('returns error 05 for brew not found', () => {
		const props = {
			brew: {
				accessType: 'edit',
				brewId: 'missing123'
			}
		};
		const errors = errorIndex(props);

		expect(errors['05']).toBeDefined();
		expect(errors['05']).toContain('document could not be found');
		expect(errors['05']).toContain('missing123');
	});

	test('returns error 06 for save error', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['06']).toBeDefined();
		expect(errors['06']).toContain('Unable to save');
	});

	test('returns error 07 for delete error', () => {
		const props = {
			brew: {
				brewId: 'delete123'
			}
		};
		const errors = errorIndex(props);

		expect(errors['07']).toBeDefined();
		expect(errors['07']).toContain('Unable to delete');
		expect(errors['07']).toContain('delete123');
	});

	test('returns error 08 for author removal error', () => {
		const props = {
			brew: {
				brewId: 'author123'
			}
		};
		const errors = errorIndex(props);

		expect(errors['08']).toBeDefined();
		expect(errors['08']).toContain('remove user');
	});

	test('returns error 09 for theme not found', () => {
		const props = {
			brew: {
				accessType: 'share',
				brewId: 'theme123'
			}
		};
		const errors = errorIndex(props);

		expect(errors['09']).toBeDefined();
		expect(errors['09']).toContain('theme document could not be found');
	});

	test('returns error 10 for invalid theme tag', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['10']).toBeDefined();
		expect(errors['10']).toContain('not tagged as a theme');
		expect(errors['10']).toContain('theme:meta');
	});

	test('returns error 11 for ID validation failure', () => {
		const props = {
			brew: {
				brewId: 'invalid@#$'
			}
		};
		const errors = errorIndex(props);

		expect(errors['11']).toBeDefined();
		expect(errors['11']).toContain('validation check');
	});

	test('returns error 13 for database connection lost', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['13']).toBeDefined();
		expect(errors['13']).toContain('Database connection has been lost');
	});

	test('returns error 50 for not signed in', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['50']).toBeDefined();
		expect(errors['50']).toContain('not signed in');
	});

	test('returns error 51 for locked brew with brew details', () => {
		const props = {
			brew: {
				brewId: 'locked123',
				brewTitle: 'Locked Brew',
				authors: ['admin']
			}
		};
		const errors = errorIndex(props);

		expect(errors['51']).toBeDefined();
		expect(errors['51']).toContain('brew has been locked');
		expect(errors['51']).toContain('locked123');
	});

	test('returns error 52 for admin access denied', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['52']).toBeDefined();
		expect(errors['52']).toContain('Access Denied');
		expect(errors['52']).toContain('administrator credentials');
	});

	test('returns lock errors 60-73', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['60']).toContain('Lock Error: General');
		expect(errors['61']).toContain('Unable to get lock count');
		expect(errors['62']).toContain('Cannot lock');
		expect(errors['63']).toContain('Brew not found');
		expect(errors['64']).toContain('Already locked');
		expect(errors['65']).toContain('Cannot unlock');
		expect(errors['66']).toContain('Brew not found');
		expect(errors['67']).toContain('Not locked');
		expect(errors['68']).toContain('Cannot get review requests');
		expect(errors['69']).toContain('Cannot set review request');
		expect(errors['70']).toContain('Brew not found');
		expect(errors['71']).toContain('Review already requested');
		expect(errors['72']).toContain('Cannot clear review request');
		expect(errors['73']).toContain('Brew not found');
	});

	test('returns error 90 for unexpected brew lookup error', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['90']).toBeDefined();
		expect(errors['90']).toContain('unexpected error');
	});

	test('returns error 91 for brew count error', () => {
		const props = { brew: {} };
		const errors = errorIndex(props);

		expect(errors['91']).toBeDefined();
		expect(errors['91']).toContain('total of brews');
	});

	test('handles missing author list gracefully', () => {
		const props = {
			brew: {
				brewTitle: 'Brew Without Authors',
				shareId: 'share789',
				authors: undefined
			}
		};
		const errors = errorIndex(props);

		expect(errors['03']).toContain('Unable to list authors');
	});

	test('escapes brew titles in error messages', () => {
		const props = {
			brew: {
				brewTitle: '<script>alert("xss")</script>',
				shareId: 'safe123',
				authors: ['user']
			}
		};
		const errors = errorIndex(props);

		// The escape function converts each character to HTML entity
		expect(errors['03']).toBeDefined();
		// Should not contain the raw script tag
		expect(errors['03']).not.toContain('<script>');
	});

	test('handles empty brew title', () => {
		const props = {
			brew: {
				brewTitle: '',
				shareId: 'share999',
				authors: ['user']
			}
		};
		const errors = errorIndex(props);

		expect(errors['03']).toContain('Unable to show title');
	});

	test('all error codes return strings', () => {
		const props = {
			brew: {
				brewTitle: 'Test',
				shareId: 'share',
				editId: 'edit',
				brewId: 'brew',
				authors: ['user'],
				accessType: 'edit'
			}
		};
		const errors = errorIndex(props);

		Object.keys(errors).forEach(key => {
			expect(typeof errors[key]).toBe('string');
		});
	});
});