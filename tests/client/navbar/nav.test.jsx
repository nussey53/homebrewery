import globalJsdom from 'jsdom-global';
globalJsdom();
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Nav from '../../../client/homebrew/navbar/nav.jsx';

describe('Nav.base', () => {
	test('renders navigation element', () => {
		const { container } = render(<Nav.base><div>Test</div></Nav.base>);

		const nav = container.querySelector('nav');
		expect(nav).toBeInTheDocument();
	});

	test('renders children inside nav', () => {
		render(<Nav.base><div>Child Content</div></Nav.base>);

		expect(screen.getByText('Child Content')).toBeInTheDocument();
	});
});

describe('Nav.logo', () => {
	test('renders logo link', () => {
		const { container } = render(<Nav.logo />);

		const link = container.querySelector('a.navLogo');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/');
	});

	test('renders logo text', () => {
		render(<Nav.logo />);

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('brewery')).toBeInTheDocument();
	});

	test('brewery text has crit class', () => {
		const { container } = render(<Nav.logo />);

		const critSpan = container.querySelector('.crit');
		expect(critSpan).toBeInTheDocument();
		expect(critSpan).toHaveTextContent('brewery');
	});
});

describe('Nav.section', () => {
	test('renders nav section div', () => {
		const { container } = render(<Nav.section>Content</Nav.section>);

		const section = container.querySelector('.navSection');
		expect(section).toBeInTheDocument();
	});

	test('renders children', () => {
		render(<Nav.section><span>Section Content</span></Nav.section>);

		expect(screen.getByText('Section Content')).toBeInTheDocument();
	});

	test('applies custom className', () => {
		const { container } = render(<Nav.section className="custom">Content</Nav.section>);

		const section = container.querySelector('.navSection');
		expect(section).toHaveClass('custom');
	});
});

describe('Nav.item', () => {
	test('renders as div when no href provided', () => {
		const { container } = render(<Nav.item>Item Text</Nav.item>);

		const item = container.querySelector('.navItem');
		expect(item.tagName).toBe('DIV');
	});

	test('renders as anchor when href provided', () => {
		const { container } = render(<Nav.item href="/test">Link Text</Nav.item>);

		const item = container.querySelector('.navItem');
		expect(item.tagName).toBe('A');
		expect(item).toHaveAttribute('href', '/test');
	});

	test('renders icon when provided', () => {
		const { container } = render(<Nav.item icon="fas fa-home">Home</Nav.item>);

		const icon = container.querySelector('.fas.fa-home');
		expect(icon).toBeInTheDocument();
	});

	test('applies color class', () => {
		const { container } = render(<Nav.item color="blue">Blue Item</Nav.item>);

		const item = container.querySelector('.navItem');
		expect(item).toHaveClass('blue');
	});

	test('calls onClick when clicked', () => {
		const handleClick = jest.fn();
		render(<Nav.item onClick={handleClick}>Clickable</Nav.item>);

		const item = screen.getByText('Clickable');
		fireEvent.click(item);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	test('opens in new tab when newTab is true', () => {
		const { container } = render(<Nav.item href="/test" newTab>Link</Nav.item>);

		const link = container.querySelector('a');
		expect(link).toHaveAttribute('target', '_blank');
	});

	test('opens in same tab by default', () => {
		const { container } = render(<Nav.item href="/test">Link</Nav.item>);

		const link = container.querySelector('a');
		expect(link).toHaveAttribute('target', '_self');
	});

	test('applies custom className', () => {
		const { container } = render(<Nav.item className="custom">Item</Nav.item>);

		const item = container.querySelector('.navItem');
		expect(item).toHaveClass('custom');
	});

	test('renders children content', () => {
		render(<Nav.item><span>Child</span></Nav.item>);

		expect(screen.getByText('Child')).toBeInTheDocument();
	});
});

describe('Nav.dropdown', () => {
	test('renders dropdown container', () => {
		const { container } = render(
			<Nav.dropdown>
				<Nav.item>Trigger</Nav.item>
				<Nav.item>Option 1</Nav.item>
			</Nav.dropdown>
		);

		const dropdown = container.querySelector('.navDropdownContainer');
		expect(dropdown).toBeInTheDocument();
	});

	test('renders first child as trigger', () => {
		render(
			<Nav.dropdown>
				<Nav.item>Trigger</Nav.item>
				<Nav.item>Option 1</Nav.item>
			</Nav.dropdown>
		);

		expect(screen.getByText('Trigger')).toBeInTheDocument();
	});

	test('shows dropdown items on hover', async () => {
		const { container } = render(
			<Nav.dropdown>
				<Nav.item>Trigger</Nav.item>
				<Nav.item>Option 1</Nav.item>
				<Nav.item>Option 2</Nav.item>
			</Nav.dropdown>
		);

		const dropdownContainer = container.querySelector('.navDropdownContainer');

		fireEvent.mouseEnter(dropdownContainer);

		await waitFor(() => {
			const dropdown = container.querySelector('.navDropdown');
			expect(dropdown).toBeInTheDocument();
		});

		expect(screen.getByText('Option 1')).toBeInTheDocument();
		expect(screen.getByText('Option 2')).toBeInTheDocument();
	});

	test('hides dropdown items on mouse leave', async () => {
		const { container } = render(
			<Nav.dropdown>
				<Nav.item>Trigger</Nav.item>
				<Nav.item>Option 1</Nav.item>
			</Nav.dropdown>
		);

		const dropdownContainer = container.querySelector('.navDropdownContainer');

		fireEvent.mouseEnter(dropdownContainer);
		await waitFor(() => {
			expect(container.querySelector('.navDropdown')).toBeInTheDocument();
		});

		fireEvent.mouseLeave(dropdownContainer);

		await waitFor(() => {
			expect(container.querySelector('.navDropdown')).not.toBeInTheDocument();
		});
	});

	test('shows dropdown on click', async () => {
		const { container } = render(
			<Nav.dropdown>
				<Nav.item>Trigger</Nav.item>
				<Nav.item>Option 1</Nav.item>
			</Nav.dropdown>
		);

		const dropdownContainer = container.querySelector('.navDropdownContainer');

		fireEvent.click(dropdownContainer);

		await waitFor(() => {
			expect(container.querySelector('.navDropdown')).toBeInTheDocument();
		});
	});

	test('closes dropdown when clicking outside', async () => {
		const { container } = render(
			<div>
				<Nav.dropdown>
					<Nav.item>Trigger</Nav.item>
					<Nav.item>Option 1</Nav.item>
				</Nav.dropdown>
				<div data-testid="outside">Outside</div>
			</div>
		);

		const dropdownContainer = container.querySelector('.navDropdownContainer');

		// Open dropdown
		fireEvent.click(dropdownContainer);
		await waitFor(() => {
			expect(container.querySelector('.navDropdown')).toBeInTheDocument();
		});

		// Click outside
		const outside = screen.getByTestId('outside');
		fireEvent.click(outside);

		await waitFor(() => {
			expect(container.querySelector('.navDropdown')).not.toBeInTheDocument();
		});
	});

	test('handles single child element', () => {
		const { container } = render(
			<Nav.dropdown>
				<Nav.item>Only Child</Nav.item>
			</Nav.dropdown>
		);

		expect(screen.getByText('Only Child')).toBeInTheDocument();
	});

	test('applies custom className', () => {
		const { container } = render(
			<Nav.dropdown className="custom-dropdown">
				<Nav.item>Trigger</Nav.item>
			</Nav.dropdown>
		);

		const dropdown = container.querySelector('.navDropdownContainer');
		expect(dropdown).toHaveClass('custom-dropdown');
	});

	test('trigger can be click only', async () => {
		const { container } = render(
			<Nav.dropdown trigger="click">
				<Nav.item>Trigger</Nav.item>
				<Nav.item>Option 1</Nav.item>
			</Nav.dropdown>
		);

		const dropdownContainer = container.querySelector('.navDropdownContainer');

		// Hover should not open
		fireEvent.mouseEnter(dropdownContainer);
		expect(container.querySelector('.navDropdown')).not.toBeInTheDocument();

		// Click should open
		fireEvent.click(dropdownContainer);
		await waitFor(() => {
			expect(container.querySelector('.navDropdown')).toBeInTheDocument();
		});
	});

	test('renders dropdown items correctly', async () => {
		const { container } = render(
			<Nav.dropdown>
				<Nav.item>Trigger</Nav.item>
				<Nav.item>First</Nav.item>
				<Nav.item>Second</Nav.item>
				<Nav.item>Third</Nav.item>
			</Nav.dropdown>
		);

		const dropdownContainer = container.querySelector('.navDropdownContainer');
		fireEvent.click(dropdownContainer);

		await waitFor(() => {
			const dropdownItems = container.querySelectorAll('.navDropdown .navItem');
			expect(dropdownItems).toHaveLength(3);
		});
	});
});