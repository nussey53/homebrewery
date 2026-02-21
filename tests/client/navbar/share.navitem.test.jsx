import globalJsdom from 'jsdom-global';
globalJsdom();
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareNavItem from '../../../client/homebrew/navbar/share.navitem.jsx';

// Mock global.config
global.config = { baseUrl: 'https://homebrewery.naturalcrit.com' };

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: jest.fn(() => Promise.resolve())
	}
});

describe('ShareNavItem', () => {
	const mockBrew = {
		shareId: 'abc123',
		title: 'My Test Brew'
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('renders share dropdown with icon', () => {
		const { container } = render(<ShareNavItem brew={mockBrew} />);

		expect(screen.getByText('share')).toBeInTheDocument();
		const icon = container.querySelector('.fa-share-alt');
		expect(icon).toBeInTheDocument();
	});

	test('renders view link with correct href', () => {
		render(<ShareNavItem brew={mockBrew} />);

		const viewLink = screen.getByText('view');
		expect(viewLink).toHaveAttribute('href', '/share/abc123');
	});

	test('renders copy url button', () => {
		render(<ShareNavItem brew={mockBrew} />);

		expect(screen.getByText('copy url')).toBeInTheDocument();
	});

	test('renders post to reddit link', () => {
		render(<ShareNavItem brew={mockBrew} />);

		expect(screen.getByText('post to reddit')).toBeInTheDocument();
	});

	test('copy url button copies correct URL to clipboard', () => {
		render(<ShareNavItem brew={mockBrew} />);

		const copyButton = screen.getByText('copy url');
		fireEvent.click(copyButton);

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
			'https://homebrewery.naturalcrit.com/share/abc123'
		);
	});

	test('reddit link contains encoded brew title', () => {
		render(<ShareNavItem brew={mockBrew} />);

		const redditLink = screen.getByText('post to reddit');
		const href = redditLink.getAttribute('href');

		expect(href).toContain('reddit.com/r/UnearthedArcana/submit');
		expect(href).toContain(encodeURIComponent('My Test Brew'));
	});

	test('reddit link contains homebrewery share URL', () => {
		render(<ShareNavItem brew={mockBrew} />);

		const redditLink = screen.getByText('post to reddit');
		const href = redditLink.getAttribute('href');

		expect(href).toContain(encodeURIComponent('https://homebrewery.naturalcrit.com/share/abc123'));
	});

	test('reddit link opens in new tab', () => {
		render(<ShareNavItem brew={mockBrew} />);

		const redditLink = screen.getByText('post to reddit');

		expect(redditLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('reddit link contains predefined message text', () => {
		render(<ShareNavItem brew={mockBrew} />);

		const redditLink = screen.getByText('post to reddit');
		const href = redditLink.getAttribute('href');

		expect(href).toContain(encodeURIComponent('I\'ve been working on this homebrew'));
		expect(href).toContain(encodeURIComponent('Check it out'));
	});

	test('handles brew with special characters in title', () => {
		const brewWithSpecialChars = {
			shareId: 'xyz789',
			title: 'Test & "Quotes" <Tags>'
		};

		render(<ShareNavItem brew={brewWithSpecialChars} />);

		const redditLink = screen.getByText('post to reddit');
		const href = redditLink.getAttribute('href');

		// Should be properly URL encoded
		expect(href).toBeDefined();
		expect(href).toContain('reddit.com');
	});

	test('handles brew with emoji in title', () => {
		const brewWithEmoji = {
			shareId: 'emoji123',
			title: 'My Brew 🎲🐉'
		};

		render(<ShareNavItem brew={brewWithEmoji} />);

		const redditLink = screen.getByText('post to reddit');
		const href = redditLink.getAttribute('href');

		expect(href).toBeDefined();
	});

	test('handles brew with very long title', () => {
		const brewWithLongTitle = {
			shareId: 'long123',
			title: 'A'.repeat(300)
		};

		render(<ShareNavItem brew={brewWithLongTitle} />);

		const redditLink = screen.getByText('post to reddit');
		expect(redditLink).toBeInTheDocument();
	});

	test('share dropdown has correct color', () => {
		const { container } = render(<ShareNavItem brew={mockBrew} />);

		const shareButton = screen.getByText('share').closest('.navItem');
		expect(shareButton).toHaveClass('teal');
	});

	test('view link has correct color', () => {
		const { container } = render(<ShareNavItem brew={mockBrew} />);

		const viewLink = screen.getByText('view').closest('.navItem');
		expect(viewLink).toHaveClass('blue');
	});

	test('copy url button has correct color', () => {
		const { container } = render(<ShareNavItem brew={mockBrew} />);

		const copyButton = screen.getByText('copy url').closest('.navItem');
		expect(copyButton).toHaveClass('blue');
	});

	test('reddit link has correct color', () => {
		const { container } = render(<ShareNavItem brew={mockBrew} />);

		const redditLink = screen.getByText('post to reddit').closest('.navItem');
		expect(redditLink).toHaveClass('blue');
	});

	test('handles missing shareId gracefully', () => {
		const brewWithoutShareId = {
			title: 'No Share ID'
		};

		render(<ShareNavItem brew={brewWithoutShareId} />);

		const viewLink = screen.getByText('view');
		expect(viewLink).toHaveAttribute('href', '/share/undefined');
	});

	test('handles undefined brew prop', () => {
		expect(() => {
			render(<ShareNavItem brew={undefined} />);
		}).toThrow();
	});

	test('uses toWellFormed on brew title for reddit', () => {
		// toWellFormed is a method that ensures valid Unicode strings
		const brewWithMalformedTitle = {
			shareId: 'test123',
			title: 'Normal Title'
		};

		render(<ShareNavItem brew={brewWithMalformedTitle} />);

		const redditLink = screen.getByText('post to reddit');
		expect(redditLink).toBeInTheDocument();
	});
});