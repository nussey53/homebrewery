import globalJsdom from 'jsdom-global';
globalJsdom();
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorNavItem from '../../../client/homebrew/navbar/error-navitem.jsx';

describe('ErrorNavItem', () => {
	test('renders conflict error (409) with default message', () => {
		const error = { response: { status: 409 } };
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText('Oops!')).toBeInTheDocument();
		expect(screen.getByText('Conflict: please refresh to get latest changes')).toBeInTheDocument();
	});

	test('renders conflict error (409) with custom message', () => {
		const error = {
			response: {
				status: 409,
				body: { message: 'Custom conflict message' }
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText('Custom conflict message')).toBeInTheDocument();
	});

	test('renders precondition failed error (412)', () => {
		const error = { response: { status: 412 } };
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/Your client is out of date/)).toBeInTheDocument();
	});

	test('renders precondition failed error (412) with custom message', () => {
		const error = {
			response: {
				status: 412,
				body: { message: 'Custom precondition message' }
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText('Custom precondition message')).toBeInTheDocument();
	});

	test('renders HBErrorCode 04 (not signed in)', () => {
		const error = {
			response: {
				body: { HBErrorCode: '04' }
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/no longer signed in as an author/)).toBeInTheDocument();
		expect(screen.getByText('Close')).toBeInTheDocument();
	});

	test('renders HBErrorCode 09 (theme retrieval problem) with brew link', () => {
		const error = {
			response: {
				body: {
					HBErrorCode: '09',
					brewId: 'theme123'
				}
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/problem retreiving/)).toBeInTheDocument();
		const link = screen.getByText('theme123');
		expect(link).toHaveAttribute('href', '/share/theme123');
	});

	test('renders HBErrorCode 10 (theme not tagged)', () => {
		const error = {
			response: {
				body: {
					HBErrorCode: '10',
					brewId: 'nottagged456'
				}
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/not tagged for use as a theme/)).toBeInTheDocument();
		expect(screen.getByText('meta:theme')).toBeInTheDocument();
	});

	test('renders HBErrorCode 13 (database connection)', () => {
		const error = {
			response: {
				body: { HBErrorCode: '13' }
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/lost connection to the database/)).toBeInTheDocument();
	});

	test('renders ECONNABORTED error', () => {
		const error = { code: 'ECONNABORTED' };
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/interrupted or timed out/)).toBeInTheDocument();
		expect(screen.getByText(/network issue/)).toBeInTheDocument();
	});

	test('renders generic error for unknown error types', () => {
		const error = { code: 'UNKNOWN_ERROR' };
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		expect(screen.getByText(/problem saving/)).toBeInTheDocument();
		expect(screen.getByText(/browser console/)).toBeInTheDocument();
	});

	test('calls clearError when error container is clicked (409)', () => {
		const error = { response: { status: 409 } };
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		const errorContainer = screen.getByText('Conflict: please refresh to get latest changes');
		fireEvent.click(errorContainer);

		expect(clearError).toHaveBeenCalledTimes(1);
	});

	test('calls clearError when error container is clicked (HBErrorCode 04)', () => {
		const error = {
			response: {
				body: { HBErrorCode: '04' }
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		const errorContainer = screen.getByText(/no longer signed in/);
		fireEvent.click(errorContainer);

		expect(clearError).toHaveBeenCalledTimes(1);
	});

	test('renders with exclamation triangle icon', () => {
		const error = { response: { status: 409 } };
		const clearError = jest.fn();

		const { container } = render(<ErrorNavItem error={error} clearError={clearError} />);

		const icon = container.querySelector('.fa-exclamation-triangle');
		expect(icon).toBeInTheDocument();
	});

	test('has error class on nav item', () => {
		const error = { response: { status: 409 } };
		const clearError = jest.fn();

		const { container } = render(<ErrorNavItem error={error} clearError={clearError} />);

		const navItem = container.querySelector('.error');
		expect(navItem).toBeInTheDocument();
	});

	test('handles empty error object gracefully', () => {
		const error = {};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		// Should render generic error
		expect(screen.getByText(/problem saving/)).toBeInTheDocument();
	});

	test('handles undefined error properties', () => {
		const error = { response: {} };
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		// Should render generic error
		expect(screen.getByText(/problem saving/)).toBeInTheDocument();
	});

	test('handles missing clearError function', () => {
		const error = { response: { status: 409 } };

		// Should not throw
		expect(() => {
			render(<ErrorNavItem error={error} />);
		}).not.toThrow();
	});

	test('theme error opens link in new tab with noopener', () => {
		const error = {
			response: {
				body: {
					HBErrorCode: '09',
					brewId: 'theme789'
				}
			}
		};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		const link = screen.getByText('theme789');
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('renders FAQ link in generic error', () => {
		const error = {};
		const clearError = jest.fn();

		render(<ErrorNavItem error={error} clearError={clearError} />);

		const faqLink = screen.getByText('FAQ');
		expect(faqLink).toHaveAttribute('href', '/faq');
	});
});