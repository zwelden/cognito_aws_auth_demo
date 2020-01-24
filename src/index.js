require('dotenv').config()

import * as cognito from './js/cognito';

import 'bulma/css/bulma.css';
import './scss/main.scss';

// action buttons
let registerUserBtn = document.getElementById('register-user-btn');
let confirmCodeBtn = document.getElementById('confirm-code');
let resendCodeBtn = document.getElementById('resend-code-btn');
let loginBtn = document.getElementById('login-btn');

// nav buttons
let backToLoginBtn = document.getElementById('back-to-login-btn');
let createAccountBtn = document.getElementById('create-account-btn');
let menuCreateAccountBtn = document.getElementById('menu-create-account-btn');
let menuLoginBtn = document.getElementById('menu-login-btn');
let homeBtn = document.querySelector('.home-btn');

// placeholder card 
let placeholderCard = document.querySelector('.placeholder-content');


registerUserBtn.onclick = (event) => {
    let username_input = document.getElementById('username-create');
    let password_input = document.getElementById('password-create');

    let username = username_input.value;
    let password = password_input.value; 

    cognito.signupUser(username, password, (res) => {
        if (res.error) {
            display_alert_message(error.message, 'warning');
            return;
        }

        if (res.result && res.result === 'SUCCESS') {
            display_alert_message('Thank you for signing up. Please enter the confirmation code sent to: ' + cognitoUser.username, 'success');
            showConfirmCodeEnterCard();
            return;
        }

        display_alert_message('An unknown error occured. Unable to signup. Please try again', 'warning');
    });
} 

confirmCodeBtn.onclick = (event) => {
    let code_input = document.getElementById('auth-confirm-code');
    let code_val = code_input.value;

    cognito.confirmCodeEntry(code_val, (res) => {
        if (res.error) {
            display_alert_message(error.message, 'warning');
            return;
        }

        if (res.result && res.result === 'SUCCESS') {
            display_alert_message('Sign up completed successfully! You can now login in.', 'success');
            showLoginCard();
            return;
        }

        display_alert_message('An unknown error occured. Unable to signup. Please try again', 'warning');
    });
}


loginBtn.onclick = (event) => {
    let username_input = document.getElementById('username');
    let password_input = document.getElementById('password');

    let username = username_input.value;
    let password = password_input.value; 

    cognito.attemptLogin(username, password, (res) => {
        if (res.error) {
            display_alert_message(error.message, 'warning');
            return;
        }

        if (res.result && res.result === 'SUCCESS') {
            display_alert_message('Successfully logged in!', 'success');
            updateLoggedInStatus(true);
            return;
        }

        display_alert_message('An unknown error occured. Unable to signup. Please try again', 'warning');
    });
}




// nav effects 
let hideAllCards = (cards) => {
    placeholderCard.classList.add('is-hidden');

    cards.forEach((card) => {
        card.classList.add('is-hidden');
    });
}



let showConfirmCodeEnterCard = () => {
    let cards = document.querySelectorAll('.auth-card');
    let confirmCodeEntryCard = document.querySelector('.code-confirm-card');

    hideAllCards(cards);
    confirmCodeEntryCard.classList.remove('is-hidden');
}


let showLoginCard = () => {
    let cards = document.querySelectorAll('.auth-card');
    let loginCard = document.querySelector('.login-card');

    hideAllCards(cards);

    loginCard.classList.remove('is-hidden');
}


let showCreateAccountCard = () => {
    let cards = document.querySelectorAll('.auth-card');
    let createAccountCard = document.querySelector('.create-account-card');

    hideAllCards(cards);

    createAccountCard.classList.remove('is-hidden');
}

let display_alert_message = (message, type) => {
    let alert_container = document.querySelector('.alert-container');

    const types = ['dark', 'primary', 'link', 'info', 'success', 'warning', 'danger'];

    if (types.indexOf(type) < 0) {
        type = 'info';
    }

    let message_el = `
        <div class="message is-${type}">
            <div class="message-body">
                <div class="message-content">
                    ${message}
                </div>
                <button class="delete message-hide-btn" onclick="dismiss_alert_message()" aria-label="delete"></button>
            </div>
        </div>
    `;

    if (alert_container.classList.contains('active')) {
        alert_container.classList.remove('active');

        setTimeout(() => {
            alert_container.innerHTML = message_el;
            alert_container.classList.add('active');
        }, 201);
    }
    else {
        alert_container.innerHTML = message_el;
        alert_container.classList.add('active');
    }    
}


let updateLoggedInStatus = (isLoggedIn) => {
    let loggedInStatusMessage = document.querySelector('.login-status-message');

    if (isLoggedIn === true) {
        loggedInStatusMessage.querySelector('.message-body').innerText = 'Logged In.';
        loggedInStatusMessage.classList.remove('is-warning');
        loggedInStatusMessage.classList.add('is-success');
    } else {
        loggedInStatusMessage.querySelector('.message-body').innerText = 'Not Logged In.';
        loggedInStatusMessage.classList.remove('is-success');
        loggedInStatusMessage.classList.add('is-warning');
    }
}


let dismiss_alert_message = () => {
    let alert_container = document.querySelector('.alert-container');
    
    alert_container.classList.remove('active');
}


let showHomeCard = () => {
    let cards = document.querySelectorAll('.auth-card');
    hideAllCards(cards);
    placeholderCard.classList.remove('is-hidden');
}


backToLoginBtn.onclick = (event) => {
    showLoginCard();
}

createAccountBtn.onclick = (event) => {
    showCreateAccountCard();
}

menuCreateAccountBtn.onclick = (event) => {
    showCreateAccountCard();
}

menuLoginBtn.onclick = (event) => {
    showLoginCard();
}

homeBtn.onclick = (event) => {
    showHomeCard();
}

window.display_alert_message = display_alert_message;
window.dismiss_alert_message = dismiss_alert_message;
window.showConfirmCodeEnterCard = showConfirmCodeEnterCard;