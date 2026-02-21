import globalJsdom from 'jsdom-global';
globalJsdom();
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountPage from '../../../client/homebrew/pages/accountPage/accountPage.jsx';

// Mock moment
jest.mock('moment', () => {
	return () => ({
		format: jest.fn(() => 'Monday, January 1st 2024, 12:00:00 pm +0000')
	});
});

describe('AccountPage', () => {
	const mockAccountDetails = {
		username: 'testuser',
		issued: '2024-01-01T12:00:00.000Z',
		mongoCount: 42
	};

	const mockBrew = {
		title: 'Test Brew'
	};

	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	test('renders account information heading', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText('Account Information')).toBeInTheDocument();
	});

	test('displays username', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText('testuser')).toBeInTheDocument();
	});

	test('displays last login date', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText(/Monday, January 1st 2024/)).toBeInTheDocument();
	});

	test('displays brew count', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText('42')).toBeInTheDocument();
	});

	test('renders Homebrewery information section', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText('Homebrewery Information')).toBeInTheDocument();
	});

	test('renders default save location section', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText('Default Save Location')).toBeInTheDocument();
	});

	test('renders Homebrewery save location button', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText('Homebrewery')).toBeInTheDocument();
	});

	test('initializes save location from localStorage', async () => {
		localStorage.setItem('HB_editor_defaultSave_testuser', 'HOMEBREWERY');

		const { container } = render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		await waitFor(() => {
			const button = screen.getByText('Homebrewery');
			expect(button).toHaveClass('active');
		});
	});

	test('defaults to HOMEBREWERY when localStorage is empty', async () => {
		const { container } = render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		await waitFor(() => {
			const button = screen.getByText('Homebrewery');
			expect(button).toHaveClass('active');
		});
	});

	test('sets localStorage when save location button is clicked', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		const button = screen.getByText('Homebrewery');
		fireEvent.click(button);

		expect(localStorage.getItem('HB_editor_defaultSave_testuser')).toBe('HOMEBREWERY');
	});

	test('handles username with special characters in localStorage key', async () => {
		const specialAccountDetails = {
			...mockAccountDetails,
			username: 'user@example.com'
		};

		render(<AccountPage accountDetails={specialAccountDetails} brew={mockBrew} />);

		await waitFor(() => {
			const button = screen.getByText('Homebrewery');
			fireEvent.click(button);
		});

		expect(localStorage.getItem('HB_editor_defaultSave_user@example.com')).toBe('HOMEBREWERY');
	});

	test('renders user icon in heading', () => {
		const { container } = render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		const userIcon = container.querySelector('.fa-user');
		expect(userIcon).toBeInTheDocument();
	});

	test('displays "No user currently logged in" when username is missing', () => {
		const accountWithoutUsername = { ...mockAccountDetails, username: '' };

		render(<AccountPage accountDetails={accountWithoutUsername} brew={mockBrew} />);

		expect(screen.getByText(/No user currently logged in/)).toBeInTheDocument();
	});

	test('displays "-" for last login when date is missing', () => {
		const accountWithoutDate = { ...mockAccountDetails, issued: null };

		// Mock moment to return different value for null
		jest.resetModules();
		jest.mock('moment', () => {
			return (date) => ({
				format: jest.fn(() => date ? 'Monday, January 1st 2024, 12:00:00 pm +0000' : '-')
			});
		});

		render(<AccountPage accountDetails={accountWithoutDate} brew={mockBrew} />);

		expect(screen.getByText(/Last Login:/)).toBeInTheDocument();
	});

	test('handles missing accountDetails gracefully', () => {
		expect(() => {
			render(<AccountPage brew={mockBrew} />);
		}).not.toThrow();
	});

	test('handles missing brew prop gracefully', () => {
		expect(() => {
			render(<AccountPage accountDetails={mockAccountDetails} />);
		}).not.toThrow();
	});

	test('does not initialize save location without username', () => {
		const accountWithoutUsername = { mongoCount: 10 };

		render(<AccountPage accountDetails={accountWithoutUsername} brew={mockBrew} />);

		// Should not throw and should not set localStorage
		expect(localStorage.length).toBe(0);
	});

	test('button does not change if already active', () => {
		localStorage.setItem('HB_editor_defaultSave_testuser', 'HOMEBREWERY');

		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		const button = screen.getByText('Homebrewery');

		// Click when already active
		fireEvent.click(button);

		// Should still be HOMEBREWERY
		expect(localStorage.getItem('HB_editor_defaultSave_testuser')).toBe('HOMEBREWERY');
	});

	test('renders with correct structure inside UIPage', () => {
		const { container } = render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		const dataGroups = container.querySelectorAll('.dataGroup');
		expect(dataGroups.length).toBeGreaterThan(0);
	});

	test('displays correct labels', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		expect(screen.getByText(/Username:/)).toBeInTheDocument();
		expect(screen.getByText(/Last Login:/)).toBeInTheDocument();
		expect(screen.getByText(/Brews on Homebrewery:/)).toBeInTheDocument();
	});

	test('mongoCount displays correctly', () => {
		render(<AccountPage accountDetails={mockAccountDetails} brew={mockBrew} />);

		const mongoCount = screen.getByText('42');
		expect(mongoCount).toBeInTheDocument();
	});

	test('handles zero brew count', () => {
		const accountWithZeroBrews = { ...mockAccountDetails, mongoCount: 0 };

		render(<AccountPage accountDetails={accountWithZeroBrews} brew={mockBrew} />);

		expect(screen.getByText('0')).toBeInTheDocument();
	});

	test('handles undefined mongoCount', () => {
		const accountWithoutCount = { ...mockAccountDetails, mongoCount: undefined };

		expect(() => {
			render(<AccountPage accountDetails={accountWithoutCount} brew={mockBrew} />);
		}).not.toThrow();
	});
});