require('dotenv').config()

import * as cognito from './js/cognito';
import aws4 from "aws4";

import 'bulma/css/bulma.css';
import './scss/main.scss';

const axios = require('axios');

const debug = false;

// action buttons
let registerUserBtn = document.getElementById('register-user-btn');
let confirmCodeBtn = document.getElementById('confirm-code');
let resendCodeBtn = document.getElementById('resend-code-btn');
let loginBtn = document.getElementById('login-btn');
let accessContentBtn = document.getElementById('access-endpoint-btn');
let forgotPasswordLink = document.getElementById('forgot-password-link');
let saveNewPasswordBtn = document.getElementById('save-new-password-btn');

// nav buttons
let backToLoginBtn = document.getElementById('back-to-login-btn');
let createAccountBtn = document.getElementById('create-account-btn');
let menuCreateAccountBtn = document.getElementById('menu-create-account-btn');
let menuLoginBtn = document.getElementById('menu-login-btn');
let signOutBtn = document.getElementById('menu-sign-out-btn');
let homeBtn = document.querySelector('.home-btn');

// placeholder card 
let placeholderCard = document.querySelector('.placeholder-content');


registerUserBtn.onclick = (event) => {
    let username_input = document.getElementById('username-create');
    let password_input = document.getElementById('password-create');

    let username = username_input.value;
    let password = password_input.value; 
    let email = username; // username is an email address.

    cognito.signupUser(username, password, email, (res) => {
        if (res.error) {
            display_alert_message(res.error.message, 'warning');
            return;
        }

        if (res.result && res.result === 'SUCCESS') {
            display_alert_message('Thank you for signing up. Please enter the confirmation code sent to: ' + username, 'success');
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
            display_alert_message(res.error.message, 'warning');
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


resendCodeBtn.onclick = (event) => {
    cognito.resendConfirmationCode((res) => {
        if (res.error) {
            display_alert_message(res.error.message, 'warning');
            return;
        }
    });
}


loginBtn.onclick = (event) => {
    let username_input = document.getElementById('username');
    let password_input = document.getElementById('password');
    let rememberMeCheckbox = document.getElementById('remember-me-checkbox');

    let username = username_input.value;
    let password = password_input.value; 

    cognito.attemptLogin(username, password, (res) => {
        if (res.error) {
            display_alert_message(res.error.message, 'warning');
            updateAuthenticatedStatus(false);
            toggleMenuAuthOptBtns(false);
            return;
        }

        if (res.fail) {
            display_alert_message(res.fail.message, 'danger');
            updateAuthenticatedStatus(false);
            toggleMenuAuthOptBtns(false);
            return;
        }

        if (res.result && res.result === 'SUCCESS') {
            display_alert_message('Successfully logged in!', 'success');
            updateAuthenticatedStatus(true);

            if (rememberMeCheckbox.checked === true) {
                cognito.rememberDevice((res) => {
                    console.log(res);
                });
            }

            showAccessEndpointCard();
            toggleMenuAuthOptBtns(true);
            return;
        }

        updateAuthenticatedStatus(false);
        toggleMenuAuthOptBtns(false);
        display_alert_message('An unknown error occured. Unable to signup. Please try again', 'warning');
    });
}


forgotPasswordLink.onclick = (event) => {
    let new_password_username = document.getElementById('new-password-username');
    let username_input = document.getElementById('username');

    let username = username_input.value;
    new_password_username.value = username;
    
    cognito.getForgotPasswordCode(username, (res) => {
        if (res.error) {
            display_alert_message('Unable to send password reset code. Error: ' + error, 'warning');

            return;
        }

        if (res.CodeDeliveryDetails) {
            display_alert_message('A password reset code has been send to ' + res.CodeDeliveryDetails.Destination, 'info');

            return;
        }
    });

    showForgotPasswordCard();
}


saveNewPasswordBtn.onclick = (event) => {
    let username_input = document.getElementById('new-password-username');
    let verification_code_input = document.getElementById('forgot-password-code');
    let password_input = document.getElementById('new-password');
    let password_confirm_input = document.getElementById('new-password-confirm');

    let verification_code = verification_code_input.value;
    let username = username_input.value;
    let password = password_input.value; 
    let password_confirm = password_confirm_input.value;

    if (password !== password_confirm) {
        display_alert_message('Password and confirm password do not match', 'warning');
    }

    cognito.setNewPassword(verification_code, password, (res) => {
        if (res.error) {
            display_alert_message('Unable to change password. Error: ' + res.error, 'danger');
            return;
        }

        if (res.result && res.result === 'success') {
            display_alert_message('password successfully changed!', 'success');
            showLoginCard();
            return;
        }
    })
}



accessContentBtn.onclick = (event) => {
    accessEndpoint();
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


let showForgotPasswordCard = () => {
    let cards = document.querySelectorAll('.auth-card');
    let createAccountCard = document.querySelector('.forgot-password-card');

    hideAllCards(cards);

    createAccountCard.classList.remove('is-hidden');
}



let showAccessEndpointCard = () => {
    let cards = document.querySelectorAll('.auth-card');
    let accessEndpointCard = document.querySelector('.access-endpoint-card');

    hideAllCards(cards);

    accessEndpointCard.classList.remove('is-hidden');
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


let updateAuthenticatedStatus = (isAuthenticated) => {
    let authenticatedStatusEl = document.querySelector('.authentication-status-message');

    if (isAuthenticated === true) {
        authenticatedStatusEl.classList.remove('is-danger');
        authenticatedStatusEl.classList.add('is-success');
    } else {
        authenticatedStatusEl.classList.remove('is-success');
        authenticatedStatusEl.classList.add('is-danger');
    }
}


let updateAuthorizedStatus = (isAuthorized) => {
    let authorizedStatusEl = document.querySelector('.authorization-status-message');

    if (isAuthorized === true) {
        authorizedStatusEl.classList.remove('is-danger');
        authorizedStatusEl.classList.add('is-success');
    } else {
        authorizedStatusEl.classList.remove('is-success');
        authorizedStatusEl.classList.add('is-danger');
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


let signoutApp = () => {
    cognito.signOut();
    updateAuthenticatedStatus(false);
    updateAuthorizedStatus(false);
    toggleMenuAuthOptBtns(false);
    showHomeCard();
    display_alert_message('Succsessfully signed out.', 'success');
}



let toggleMenuAuthOptBtns = (isLoggedIn) => {
    if (isLoggedIn === true) {
        menuCreateAccountBtn.classList.add('is-hidden');
        menuLoginBtn.classList.add('is-hidden');
        signOutBtn.classList.remove('is-hidden');

        return;
    }
    
    menuCreateAccountBtn.classList.remove('is-hidden');
    menuLoginBtn.classList.remove('is-hidden');
    signOutBtn.classList.add('is-hidden');
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

signOutBtn.onclick = (event) => {
    signoutApp();
}


let accessEndpoint = () => {
    let userCredentials = cognito.getUserCredentials();

    let statusSpan = document.querySelector('.endpoint-result-status');
    let messageSpan = document.querySelector('.endpoint-result-message');
    let randNumSpan = document.querySelector('.endpoint-result-rand-num');

    statusSpan.innerText = 'Pending';
    messageSpan.innerText = '';
    randNumSpan.innerText = '';

    if (debug === true) {
        console.log('user credentials');
        console.log(userCredentials);
    }
    

    const sessionToken = userCredentials.params.Logins['cognito-idp.'+ process.env.AWS_REGION +'.amazonaws.com/' + process.env.COGNITO_POOL_ID];

    const request = {
        "method": "GET",
        "url": "https://" + process.env.API_HOST + "/dev/auth",
        "headers": {
            "Authorization": sessionToken
        }
    };

    if (debug === true) {
        console.log(request);
    }
    
    axios(request).then((res) => {
        console.log(res);

        let res_body = JSON.parse(res.data.body);

        let status = res_body.status;
        let message = res_body.message;
        let randNum = res_body.rand_num;

        if (status === 'success') {
            updateAuthorizedStatus(true);
            display_alert_message('Successfully accessed restricted content', 'success');

            statusSpan.innerText = status;
            messageSpan.innerText = message;
            randNumSpan.innerText = randNum;
        }
        else {
            updateAuthorizedStatus(false);
            display_alert_message('Unable to access restricted content', 'warning');
            statusSpan.innerText = 'access failed';
        }
    })
    .catch((err) => {
        console.log('error');
        console.log(err);
        updateAuthorizedStatus(false);
        display_alert_message('Unable to access restricted content', 'warning');
        statusSpan.innerText = 'access failed';
    });
}

let accessEndpointNoAuth = () => {
    axios.get('https://' + process.env.API_HOST + '/dev/auth').then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log('error');
        console.log(err);
    });
}




window.display_alert_message = display_alert_message;
window.dismiss_alert_message = dismiss_alert_message;
window.showConfirmCodeEnterCard = showConfirmCodeEnterCard;
window.accessEndpoint = accessEndpoint;
window.accessEndpointNoAuth = accessEndpointNoAuth;

// load up session if possible 

cognito.setCognitoUserFromSession((res) => {

    if (debug === true) {
        console.log(res);
    }
    

    if (res.result === 'SUCCESS') {
        display_alert_message('Successfully logged in from a stored session!', 'success');
        updateAuthenticatedStatus(true);
        showAccessEndpointCard();
        toggleMenuAuthOptBtns(true);
    }
});
