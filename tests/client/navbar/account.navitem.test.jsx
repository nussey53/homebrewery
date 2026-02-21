import globalJsdom from 'jsdom-global';
globalJsdom();
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountNavItem from '../../../client/homebrew/navbar/account.navitem.jsx';

// Mock superagent
jest.mock('superagent', () => {
	const mockRequest = {
		post: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis(),
		then: jest.fn((callback) => {
			callback({ body: 'mock-token-123' });
			return mockRequest;
		}),
		catch: jest.fn((callback) => mockRequest)
	};
	return mockRequest;
});

describe('AccountNavItem - Logged In', () => {
	beforeEach(() => {
		global.account = {
			username: 'TestUser'
		};
		jest.clearAllMocks();
		delete window.location;
		window.location = { reload: jest.fn(), hostname: 'homebrewery.naturalcrit.com' };
	});

	afterEach(() => {
		delete global.account;
	});

	test('renders username when logged in', () => {
		render(<AccountNavItem />);

		expect(screen.getByText('TestUser')).toBeInTheDocument();
	});

	test('renders brews link when logged in', () => {
		render(<AccountNavItem />);

		const brewsLink = screen.getByText('brews');
		expect(brewsLink).toBeInTheDocument();
	});

	test('brews link has correct href with encoded username', () => {
		global.account.username = 'User With Spaces';
		render(<AccountNavItem />);

		const brewsLink = screen.getByText('brews');
		expect(brewsLink).toHaveAttribute('href', '/user/User%20With%20Spaces');
	});

	test('renders account link when logged in', () => {
		render(<AccountNavItem />);

		const accountLinks = screen.getAllByText('account');
		const accountLink = accountLinks.find(el => el.getAttribute('href') === '/account');
		expect(accountLink).toBeInTheDocument();
	});

	test('renders logout button when logged in', () => {
		render(<AccountNavItem />);

		expect(screen.getByText('logout')).toBeInTheDocument();
	});

	test('logout button shows confirmation dialog', () => {
		window.confirm = jest.fn(() => false);

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to log out?');
	});

	test('logout cancels when user declines confirmation', () => {
		window.confirm = jest.fn(() => false);
		const originalCookie = document.cookie;

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		expect(window.location).not.toHaveProperty('href');
	});

	test('logout clears localStorage pane split on confirmation', () => {
		window.confirm = jest.fn(() => true);
		localStorage.setItem('naturalcrit-pane-split', '50');

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		expect(localStorage.getItem('naturalcrit-pane-split')).toBeNull();
	});

	test('logout sets cookie expiration in the past', () => {
		window.confirm = jest.fn(() => true);
		Object.defineProperty(document, 'cookie', {
			writable: true,
			value: ''
		});

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		// Cookie should be set with past date
		expect(document.cookie).toContain('expires=Thu, 01 Jan 1970 00:00:01 GMT');
	});

	test('username has correct icon', () => {
		const { container } = render(<AccountNavItem />);

		const usernameItem = screen.getByText('TestUser').closest('.navItem');
		const icon = usernameItem.querySelector('.fa-user');
		expect(icon).toBeInTheDocument();
	});

	test('brews link has beer icon', () => {
		const { container } = render(<AccountNavItem />);

		const brewsLink = screen.getByText('brews').closest('.navItem');
		const icon = brewsLink.querySelector('.fa-beer');
		expect(icon).toBeInTheDocument();
	});

	test('logout has power-off icon', () => {
		const { container } = render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout').closest('.navItem');
		const icon = logoutButton.querySelector('.fa-power-off');
		expect(icon).toBeInTheDocument();
	});

	test('renders as dropdown when logged in', () => {
		const { container } = render(<AccountNavItem />);

		const dropdown = container.querySelector('.navDropdownContainer');
		expect(dropdown).toBeInTheDocument();
	});
});

describe('AccountNavItem - Logged Out', () => {
	beforeEach(() => {
		global.account = undefined;
		jest.clearAllMocks();
		window.prompt = jest.fn();
		delete window.location;
		window.location = { reload: jest.fn() };
	});

	test('renders login button when logged out', () => {
		render(<AccountNavItem />);

		expect(screen.getByText('login')).toBeInTheDocument();
	});

	test('login button has sign-in icon', () => {
		const { container } = render(<AccountNavItem />);

		const loginButton = screen.getByText('login').closest('.navItem');
		const icon = loginButton.querySelector('.fa-sign-in-alt');
		expect(icon).toBeInTheDocument();
	});

	test('login button has teal color', () => {
		const { container } = render(<AccountNavItem />);

		const loginButton = screen.getByText('login').closest('.navItem');
		expect(loginButton).toHaveClass('teal');
	});

	test('clicking login shows username prompt', () => {
		window.prompt = jest.fn(() => null);

		render(<AccountNavItem />);

		const loginButton = screen.getByText('login');
		fireEvent.click(loginButton);

		expect(window.prompt).toHaveBeenCalledWith('Enter username:');
	});

	test('login cancels if no username entered', async () => {
		window.prompt = jest.fn(() => null);

		render(<AccountNavItem />);

		const loginButton = screen.getByText('login');
		fireEvent.click(loginButton);

		expect(window.location.reload).not.toHaveBeenCalled();
	});

	test('login cancels if empty username entered', async () => {
		window.prompt = jest.fn(() => '');

		render(<AccountNavItem />);

		const loginButton = screen.getByText('login');
		fireEvent.click(loginButton);

		expect(window.location.reload).not.toHaveBeenCalled();
	});

	test('does not render dropdown when logged out', () => {
		const { container } = render(<AccountNavItem />);

		const dropdown = container.querySelector('.navDropdownContainer');
		expect(dropdown).not.toBeInTheDocument();
	});
});

describe('AccountNavItem - Domain handling', () => {
	beforeEach(() => {
		global.account = { username: 'TestUser' };
		window.confirm = jest.fn(() => true);
	});

	test('handles subdomain correctly', () => {
		delete window.location;
		window.location = { hostname: 'homebrewery.naturalcrit.com' };

		Object.defineProperty(document, 'cookie', {
			writable: true,
			value: ''
		});

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		expect(document.cookie).toContain('domain=.naturalcrit.com');
	});

	test('handles two-part domain', () => {
		delete window.location;
		window.location = { hostname: 'homebrewery.com' };

		Object.defineProperty(document, 'cookie', {
			writable: true,
			value: ''
		});

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		expect(document.cookie).toContain('domain=homebrewery.com');
	});

	test('handles localhost', () => {
		delete window.location;
		window.location = { hostname: 'localhost' };

		Object.defineProperty(document, 'cookie', {
			writable: true,
			value: ''
		});

		render(<AccountNavItem />);

		const logoutButton = screen.getByText('logout');
		fireEvent.click(logoutButton);

		// Should not set domain for localhost
		expect(document.cookie).not.toContain('domain=localhost');
	});
});