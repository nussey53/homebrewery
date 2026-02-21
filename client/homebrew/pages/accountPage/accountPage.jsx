import React from 'react';
import moment from 'moment';
import UIPage from '../basePages/uiPage/uiPage.jsx';
import NaturalCritIcon from '../../../components/svg/naturalcrit-d20.svg.jsx';

let SAVEKEY = '';

const AccountPage = (props)=>{
	// destructure props and set state for save location
	const { accountDetails, brew } = props;
	const [saveLocation, setSaveLocation] = React.useState('');

	// initialize save location from local storage based on user id
	React.useEffect(()=>{
		if(!saveLocation && accountDetails.username) {
			SAVEKEY = `HB_editor_defaultSave_${accountDetails.username}`;
			let saveLocation = window.localStorage.getItem(SAVEKEY);
			saveLocation = saveLocation === 'HOMEBREWERY' ? saveLocation : 'HOMEBREWERY';
			setActiveSaveLocation(saveLocation);
		}
	}, []);

	const setActiveSaveLocation = (newSelection)=>{
		if(saveLocation === newSelection) return;
		window.localStorage.setItem(SAVEKEY, newSelection);
		setSaveLocation(newSelection);
	};

	// todo: should this be a set of radio buttons (well styled) since it's either/or choice?
	const renderSaveLocationButton = (name, key)=>{
		return (
			<button className={saveLocation === key ? 'active' : ''} onClick={()=>{setActiveSaveLocation(key);}}>
				{name}
			</button>
		);
	};

	// render the entirety of the account page content
	const renderAccountPage = ()=>{
		return (
			<>
				<div className='dataGroup'>
					<h1>Account Information <i className='fas fa-user'></i></h1>
					<p><strong>Username: </strong>{accountDetails.username || 'No user currently logged in'}</p>
					<p><strong>Last Login: </strong>{moment(accountDetails.issued).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ') || '-'}</p>
				</div>
				<div className='dataGroup'>
					<h3>Homebrewery Information <NaturalCritIcon /></h3>
					<p><strong>Brews on Homebrewery: </strong>{accountDetails.mongoCount}</p>
				</div>
				<div className='dataGroup'>
					<h4>Default Save Location</h4>
					{renderSaveLocationButton('Homebrewery', 'HOMEBREWERY')}
				</div>
			</>
		);
	};

	// return the account page inside the base layout wrapper (with navbar etc).
	return (
		<UIPage brew={brew}>
			{renderAccountPage()}
		</UIPage>);
};

export default AccountPage;
