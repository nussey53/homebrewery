import globalJsdom from 'jsdom-global';
globalJsdom();
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrewItem from '../../../client/homebrew/pages/basePages/listPage/brewItem/brewItem.jsx';

// Mock request
jest.mock('../../../client/homebrew/utils/request-middleware.js', () => ({
	delete: jest.fn(() => ({
		send: jest.fn(() => ({
			end: jest.fn((callback) => callback(null, { body: {} }))
		}))
	}))
}));

describe('BrewItem', () => {
	const mockBrew = {
		title: 'Test Brew',
		description: 'Test Description',
		authors: ['author1', 'author2'],
		tags: ['type:class', 'system:5e', 'group:combat'],
		editId: 'edit123',
		shareId: 'share123',
		views: 100,
		pageCount: 5,
		createdAt: '2023-01-01T00:00:00.000Z',
		updatedAt: '2023-06-01T00:00:00.000Z',
		lastViewed: '2023-06-15T00:00:00.000Z',
		thumbnail: 'https://example.com/thumb.png'
	};

	beforeEach(() => {
		jest.clearAllMocks();
		window.confirm = jest.fn(() => false);
		delete window.location;
		window.location = { reload: jest.fn() };
	});

	test('renders brew title', () => {
		render(<BrewItem brew={mockBrew} />);

		expect(screen.getByText('Test Brew')).toBeInTheDocument();
	});

	test('renders brew description', () => {
		render(<BrewItem brew={mockBrew} />);

		expect(screen.getByText('Test Description')).toBeInTheDocument();
	});

	test('renders authors list', () => {
		render(<BrewItem brew={mockBrew} />);

		expect(screen.getByText('author1')).toBeInTheDocument();
		expect(screen.getByText('author2')).toBeInTheDocument();
	});

	test('renders author links with correct href', () => {
		render(<BrewItem brew={mockBrew} />);

		const author1Link = screen.getByText('author1');
		expect(author1Link).toHaveAttribute('href', '/user/author1');
	});

	test('renders tags', () => {
		render(<BrewItem brew={mockBrew} />);

		expect(screen.getByText('class')).toBeInTheDocument();
		expect(screen.getByText('5e')).toBeInTheDocument();
		expect(screen.getByText('combat')).toBeInTheDocument();
	});

	test('tags have correct classes based on prefix', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const classTag = screen.getByText('class');
		expect(classTag).toHaveClass('type');

		const systemTag = screen.getByText('5e');
		expect(systemTag).toHaveClass('system');

		const groupTag = screen.getByText('combat');
		expect(groupTag).toHaveClass('group');
	});

	test('renders view count', () => {
		render(<BrewItem brew={mockBrew} />);

		expect(screen.getByText('100')).toBeInTheDocument();
	});

	test('renders page count', () => {
		render(<BrewItem brew={mockBrew} />);

		expect(screen.getByText('5')).toBeInTheDocument();
	});

	test('renders thumbnail', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const thumbnail = container.querySelector('.thumbnail');
		expect(thumbnail).toBeInTheDocument();
		expect(thumbnail).toHaveStyle('background-image: url(https://example.com/thumb.png)');
	});

	test('does not render thumbnail when not provided', () => {
		const brewWithoutThumbnail = { ...mockBrew, thumbnail: undefined };
		const { container } = render(<BrewItem brew={brewWithoutThumbnail} />);

		const thumbnail = container.querySelector('.thumbnail');
		expect(thumbnail).not.toBeInTheDocument();
	});

	test('renders edit link when editId provided', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const editLink = container.querySelector('.editLink');
		expect(editLink).toBeInTheDocument();
		expect(editLink).toHaveAttribute('href', '/edit/edit123');
	});

	test('does not render edit link when editId missing', () => {
		const brewWithoutEdit = { ...mockBrew, editId: undefined };
		const { container } = render(<BrewItem brew={brewWithoutEdit} />);

		const editLink = container.querySelector('.editLink');
		expect(editLink).not.toBeInTheDocument();
	});

	test('renders share link when shareId provided', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const shareLink = container.querySelector('.shareLink');
		expect(shareLink).toBeInTheDocument();
		expect(shareLink).toHaveAttribute('href', '/share/share123');
	});

	test('does not render share link when shareId missing', () => {
		const brewWithoutShare = { ...mockBrew, shareId: undefined };
		const { container } = render(<BrewItem brew={brewWithoutShare} />);

		const shareLink = container.querySelector('.shareLink');
		expect(shareLink).not.toBeInTheDocument();
	});

	test('renders download link when shareId provided', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const downloadLink = container.querySelector('.downloadLink');
		expect(downloadLink).toBeInTheDocument();
		expect(downloadLink).toHaveAttribute('href', '/download/share123');
	});

	test('renders delete link when editId provided', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const deleteLink = container.querySelector('.deleteLink');
		expect(deleteLink).toBeInTheDocument();
	});

	test('delete shows confirmation for sole owner', () => {
		window.confirm = jest.fn(() => false);
		const soleOwnerBrew = { ...mockBrew, authors: ['onlyauthor'] };

		const { container } = render(<BrewItem brew={soleOwnerBrew} />);

		const deleteLink = container.querySelector('.deleteLink');
		fireEvent.click(deleteLink);

		expect(window.confirm).toHaveBeenCalledWith(
			expect.stringContaining('only owner')
		);
	});

	test('delete shows different confirmation for multiple owners', () => {
		window.confirm = jest.fn(() => false);

		const { container } = render(<BrewItem brew={mockBrew} />);

		const deleteLink = container.querySelector('.deleteLink');
		fireEvent.click(deleteLink);

		expect(window.confirm).toHaveBeenCalledWith(
			expect.stringContaining('remove this brew from your collection')
		);
	});

	test('delete requires two confirmations', () => {
		window.confirm = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false);

		const { container } = render(<BrewItem brew={mockBrew} />);

		const deleteLink = container.querySelector('.deleteLink');
		fireEvent.click(deleteLink);

		expect(window.confirm).toHaveBeenCalledTimes(2);
	});

	test('clicking tag calls updateListFilter', () => {
		const mockUpdateFilter = jest.fn();

		render(<BrewItem brew={mockBrew} updateListFilter={mockUpdateFilter} />);

		const classTag = screen.getByText('class');
		fireEvent.click(classTag);

		expect(mockUpdateFilter).toHaveBeenCalledWith('type:class');
	});

	test('renders storage icon when renderStorage is true', () => {
		const { container } = render(<BrewItem brew={mockBrew} renderStorage={true} />);

		const storageIcon = container.querySelector('.homebreweryIcon');
		expect(storageIcon).toBeInTheDocument();
	});

	test('does not render storage icon when renderStorage is false', () => {
		const { container } = render(<BrewItem brew={mockBrew} renderStorage={false} />);

		const storageIcon = container.querySelector('.homebreweryIcon');
		expect(storageIcon).not.toBeInTheDocument();
	});

	test('sorts tags with prefix before non-prefix', () => {
		const brewWithMixedTags = {
			...mockBrew,
			tags: ['regular', 'type:monster', 'another', 'system:dnd']
		};

		render(<BrewItem brew={brewWithMixedTags} />);

		const tags = screen.getAllByText(/monster|dnd|regular|another/);
		// Prefixed tags should come first
		expect(tags[0]).toHaveTextContent('monster');
		expect(tags[1]).toHaveTextContent('dnd');
	});

	test('filters out empty string tags', () => {
		const brewWithEmptyTags = {
			...mockBrew,
			tags: ['valid', '', 'another', '']
		};

		render(<BrewItem brew={brewWithEmptyTags} />);

		expect(screen.getByText('valid')).toBeInTheDocument();
		expect(screen.getByText('another')).toBeInTheDocument();
	});

	test('handles undefined tags array', () => {
		const brewWithoutTags = { ...mockBrew, tags: undefined };

		expect(() => {
			render(<BrewItem brew={brewWithoutTags} />);
		}).not.toThrow();
	});

	test('renders "updated at" timestamp', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		// Should show "from now" format
		const syncIcon = container.querySelector('.fa-sync-alt');
		expect(syncIcon).toBeInTheDocument();
	});

	test('handles hidden author username', () => {
		const brewWithHidden = { ...mockBrew, authors: ['normaluser', 'hidden'] };

		render(<BrewItem brew={brewWithHidden} />);

		const hiddenText = screen.getByText('hidden');
		expect(hiddenText).toBeInTheDocument();
		expect(hiddenText).toHaveAttribute('title', expect.stringContaining('email address'));
	});

	test('renders authors without links for hidden users', () => {
		const brewWithHidden = { ...mockBrew, authors: ['hidden'] };

		const { container } = render(<BrewItem brew={brewWithHidden} />);

		const hiddenText = screen.getByText('hidden');
		// Should be a span, not a link
		expect(hiddenText.tagName).toBe('SPAN');
	});

	test('handles empty authors array', () => {
		const brewWithoutAuthors = { ...mockBrew, authors: [] };

		expect(() => {
			render(<BrewItem brew={brewWithoutAuthors} />);
		}).not.toThrow();
	});

	test('handles undefined authors', () => {
		const brewWithoutAuthors = { ...mockBrew, authors: undefined };

		expect(() => {
			render(<BrewItem brew={brewWithoutAuthors} />);
		}).not.toThrow();
	});

	test('edit link opens in new tab', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const editLink = container.querySelector('.editLink');
		expect(editLink).toHaveAttribute('target', '_blank');
		expect(editLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('share link opens in new tab', () => {
		const { container } = render(<BrewItem brew={mockBrew} />);

		const shareLink = container.querySelector('.shareLink');
		expect(shareLink).toHaveAttribute('target', '_blank');
		expect(shareLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('handles default props', () => {
		expect(() => {
			render(<BrewItem />);
		}).not.toThrow();
	});

	test('renders with stubbed brew', () => {
		const stubbedBrew = {
			title: 'Stubbed',
			description: 'Stub description',
			authors: [],
			stubbed: true
		};

		render(<BrewItem brew={stubbedBrew} />);

		expect(screen.getByText('Stubbed')).toBeInTheDocument();
	});
});