import './error-navitem.less';
import React from 'react';
import Nav from './nav.jsx';

const ErrorNavItem = ({ error = '', clearError })=>{
	const response    = error.response;
	const errorCode   = error.code;
	const status      = response?.status;
	const HBErrorCode = response?.body?.HBErrorCode;
	const message     = response?.body?.message;

	if(status === 409) {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				{message ?? 'Conflict: please refresh to get latest changes'}
			</div>
		</Nav.item>;
	}

	if(status === 412) {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				{message ?? 'Your client is out of date. Please save your changes elsewhere and refresh.'}
			</div>
		</Nav.item>;
	}

	if(HBErrorCode === '04') {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				You are no longer signed in as an author of
				this brew! Use the login option in the top-right menu, then try again.
				<div className='deny'>
					Close
				</div>
			</div>
		</Nav.item>;
	}

	if(HBErrorCode === '09') {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				Looks like there was a problem retreiving
				the theme, or a theme that it inherits,
				for this brew. Verify that brew <a className='lowercase' target='_blank' rel='noopener noreferrer' href={`/share/${response.body.brewId}`}>
					{response.body.brewId}</a> still exists!
			</div>
		</Nav.item>;
	}

	if(HBErrorCode === '10') {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				Looks like the brew you have selected
				as a theme is not tagged for use as a
				theme. Verify that
				brew <a className='lowercase' target='_blank' rel='noopener noreferrer' href={`/share/${response.body.brewId}`}>
					{response.body.brewId}</a> has the <span className='lowercase'>meta:theme</span> tag!
			</div>
		</Nav.item>;
	}

	if(HBErrorCode === '13') {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				Server has lost connection to the database.
			</div>
		</Nav.item>;
	}

	if(errorCode === 'ECONNABORTED') {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				The request to the server was interrupted or timed out.
				This can happen due to a network issue, or if
				trying to save a particularly large brew.
				Please check your internet connection and try again.
			</div>
		</Nav.item>;
	}

	return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
		Oops!
		<div className='errorContainer'>
			Looks like there was a problem saving. <br />
			Open your browser console for details, then review troubleshooting in <a href='/faq'>FAQ</a>.
		</div>
	</Nav.item>;
};

export default ErrorNavItem;
