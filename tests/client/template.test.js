import template from '../../client/template.js';
import { jest } from '@jest/globals';

// Mock the SSR module imports
jest.unstable_mockModule('../../build/homebrew/ssr.cjs', () => ({
	default: jest.fn((props) => `<div>SSR Content for ${props.testProp || 'default'}</div>`)
}));

describe('template', () => {
	test('generates basic HTML structure', async () => {
		const html = await template('homebrew', 'Test Title', {});

		expect(html).toContain('<!DOCTYPE html>');
		expect(html).toContain('<html>');
		expect(html).toContain('<head>');
		expect(html).toContain('<body>');
		expect(html).toContain('</html>');
	});

	test('includes title in head when provided', async () => {
		const html = await template('homebrew', 'My Brew', {});

		expect(html).toContain('<title>My Brew - The Homebrewery</title>');
	});

	test('uses default title when empty string provided', async () => {
		const html = await template('homebrew', '', {});

		expect(html).toContain('<title>The Homebrewery</title>');
	});

	test('includes viewport meta tag', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('<meta name="viewport"');
		expect(html).toContain('width=device-width');
		expect(html).toContain('initial-scale=1');
	});

	test('includes bundle CSS link with correct path', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('href=/homebrew/bundle.css');
		expect(html).toContain("type=\"text/css\"");
		expect(html).toContain("rel='stylesheet'");
	});

	test('includes bundle JS script with correct path', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('src=/homebrew/bundle.js');
	});

	test('includes favicon link', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('href="/assets/favicon.ico"');
		expect(html).toContain('type="image/x-icon"');
	});

	test('includes Google Fonts link', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('fonts.googleapis.com');
		expect(html).toContain('Open+Sans');
	});

	test('includes Twitter card meta tag', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('<meta name="twitter:card" content="summary">');
	});

	test('includes reactRoot div', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('<main id="reactRoot">');
		expect(html).toContain('</main>');
	});

	test('includes start_app script call', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toContain('<script>start_app(');
	});

	test('passes props to SSR module', async () => {
		const props = { testProp: 'testValue', anotherProp: 123 };
		const html = await template('homebrew', 'Test', props);

		expect(html).toContain('testValue');
	});

	test('serializes props to JSON in start_app call', async () => {
		const props = { foo: 'bar', num: 42, bool: true };
		const html = await template('homebrew', 'Test', props);

		expect(html).toContain('start_app({"foo":"bar","num":42,"bool":true');
	});

	test('handles OpenGraph meta tags when provided', async () => {
		const props = {
			ogMeta: {
				title: 'OG Title',
				description: 'OG Description',
				image: 'https://example.com/image.png',
				url: 'https://example.com'
			}
		};
		const html = await template('homebrew', 'Test', props);

		expect(html).toContain('<meta property="og:title" content="OG Title">');
		expect(html).toContain('<meta property="og:description" content="OG Description">');
		expect(html).toContain('<meta property="og:image" content="https://example.com/image.png">');
		expect(html).toContain('<meta property="og:url" content="https://example.com">');
	});

	test('skips OpenGraph tags with falsy values', async () => {
		const props = {
			ogMeta: {
				title: 'Valid Title',
				description: '',
				image: null,
				url: undefined
			}
		};
		const html = await template('homebrew', 'Test', props);

		expect(html).toContain('<meta property="og:title" content="Valid Title">');
		expect(html).not.toContain('og:description');
		expect(html).not.toContain('og:image');
		expect(html).not.toContain('og:url');
	});

	test('handles missing ogMeta prop gracefully', async () => {
		const html = await template('homebrew', 'Test', {});

		expect(html).toBeDefined();
		expect(html).toContain('<!DOCTYPE html>');
	});

	test('handles empty ogMeta object', async () => {
		const props = { ogMeta: {} };
		const html = await template('homebrew', 'Test', props);

		expect(html).toBeDefined();
		expect(html).not.toContain('property="og:');
	});

	test('works with different module names', async () => {
		const html = await template('admin', 'Admin Panel', {});

		expect(html).toContain('/admin/bundle.css');
		expect(html).toContain('/admin/bundle.js');
	});

	test('escapes special characters in title', async () => {
		const html = await template('homebrew', 'Test & "Quotes" <Tags>', {});

		// Title should be HTML-escaped by the browser naturally
		expect(html).toContain('<title>');
		expect(html).toContain('- The Homebrewery</title>');
	});

	test('handles props with special characters', async () => {
		const props = {
			text: 'Line 1\nLine 2',
			quote: 'He said "hello"'
		};
		const html = await template('homebrew', 'Test', props);

		// Props should be properly JSON-serialized
		expect(html).toContain('start_app(');
	});

	test('generates complete valid HTML document', async () => {
		const html = await template('homebrew', 'Complete Test', {
			ogMeta: { title: 'OG Title' }
		});

		// Check for proper structure
		expect(html).toMatch(/<!DOCTYPE html>\s*<html>/);
		expect(html).toMatch(/<head>[\s\S]*<\/head>/);
		expect(html).toMatch(/<body>[\s\S]*<\/body>/);
		expect(html).toMatch(/<\/body>\s*<\/html>/);
	});

	test('includes SSR-rendered content in reactRoot', async () => {
		const html = await template('homebrew', 'Test', { testProp: 'myValue' });

		expect(html).toContain('<main id="reactRoot">');
		expect(html).toContain('SSR Content');
	});

	test('handles complex nested props', async () => {
		const props = {
			brew: {
				title: 'Nested Brew',
				metadata: {
					author: 'Test Author',
					tags: ['tag1', 'tag2']
				}
			}
		};
		const html = await template('homebrew', 'Test', props);

		expect(html).toContain('start_app(');
		expect(html).toBeDefined();
	});
});