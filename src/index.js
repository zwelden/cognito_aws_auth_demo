require('dotenv').config()

import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';

import * as AWS from 'aws-sdk/global';

import 'bulma/css/bulma.css';
import './scss/main.scss';

const poolData = {
    UserPoolId: process.env.COGNITO_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
}

const userPool = new CognitoUserPool(poolData);

// action buttons
let registerUserBtn = document.getElementById('register-user-btn');
let confirmCodeBtn = document.getElementById('confirm-code');
let resendCodeBtn = document.getElementById('resend-code-btn');
let loginBtn = document.getElementById('login-btn');


let cognitoUser = {};


registerUserBtn.onclick = (event) => {
    let username_input = document.getElementById('username-create');
    let password_input = document.getElementById('password-create');

    let username = username_input.value;
    let password = password_input.value; 

    userPool.signUp(username, password, [], null, function (
        err,
        result
    ) {
        if (err) {
            display_alert_message(err.message, 'warning');
            return;
        }

        cognitoUser = result.user;

        if (result.user && result.user.authenticationFlowType === 'USER_SRP_AUTH') {
            display_alert_message('Thank you for signing up. Please enter the confirmation code sent to: ' + cognitoUser.username, 'success');

            showConfirmCodeEnterCard();
        }

        console.log(result);
    })
} 

confirmCodeBtn.onclick = (event) => {
    let code_input = document.getElementById('auth-confirm-code');
    let code_val = code_input.value;

    cognitoUser.confirmRegistration(code_val, true, function (err, result) {
        if (err) {
            display_alert_message(err.message, 'warning');
            return;
        }


        if (result === 'SUCCESS') {
            display_alert_message('Sign up completed successfully! You can now login in.', 'success');

            showLoginCard();
        }

        console.log(result);
    });
}


loginBtn.onclick = (event) => {
    let username_input = document.getElementById('username');
    let password_input = document.getElementById('password');

    let username = username_input.value;
    let password = password_input.value; 

    let authenticationData = {
        Username: username,
        Password: password
    };

    let authenticationDetails = new AuthenticationDetails(authenticationData);

    let userData = {
        Username: username,
        Pool: userPool
    };

    cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            let accessToken = result.getAccessToken().getJwtToken();

            AWS.config.region = 'us-east-1';

            let credentials_obj = {
                Logins: {}
            };
            credentials_obj.Logins['cognito-idp.us-east-1.amazonaws.com/' + process.env.COGNITO_POOL_ID] = result.getIdToken().getJwtToken();
            credentials_obj.IdentityPoolId = process.env.IDENTITY_POOL_ID;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials_obj);

            AWS.config.credentials.refresh(error => {
                if (error) {
                    console.log('refresh error');
                    console.log(error);
                } else {
                    display_alert_message('Successfully logged in!', 'success');
                }
            })
        },
        onFailure: (err) => {
            console.log('onFailuer err');
            console.log(err)
            display_alert_message(err.message, 'warning');
        }
    })
}




// nav buttons
let backToLoginBtn = document.getElementById('back-to-login-btn');
let createAccountBtn = document.getElementById('create-account-btn');
let menuCreateAccountBtn = document.getElementById('menu-create-account-btn');
let menuLoginBtn = document.getElementById('menu-login-btn');

// placeholder card 
let placeholderCard = document.querySelector('.placeholder-content');

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


let dismiss_alert_message = () => {
    let alert_container = document.querySelector('.alert-container');
    
    alert_container.classList.remove('active');
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

window.display_alert_message = display_alert_message;
window.dismiss_alert_message = dismiss_alert_message;
window.showConfirmCodeEnterCard = showConfirmCodeEnterCard;