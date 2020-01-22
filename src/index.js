require('dotenv').config()

import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
} from 'amazon-cognito-identity-js';

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
let loginBtn = document.getElementById('lodgin-btn');




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
            console.log(err);
            return;
        }

        let cognitoUser = result.user;
        console.log(cognitoUser);
    })
} 

confirmCodeBtn.onclick = (event) => {
    let code_input = document.getElementById('auth-confirm-code');
    let code_val = code_input.value;

    let userData = {
        Username: 'zach.cw@gmail.com',
        Pool: userPool
    };

    let cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code_val, true, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(result);
    });
}


// nav buttons
let backToLoginBtn = document.getElementById('back-to-login-btn');
let createAccountBtn = document.getElementById('create-account-btn');

// nav effects 
let hideAllCards = (cards) => {
    cards.forEach((card) => {
        card.classList.add('is-hidden');
    })
}

backToLoginBtn.onclick = (event) => {
    let cards = document.querySelectorAll('.auth-card');
    let loginCard = document.querySelector('.login-card');

    hideAllCards(cards);

    loginCard.classList.remove('is-hidden');
}

createAccountBtn.onclick = (event) => {
    let cards = document.querySelectorAll('.auth-card');
    let createAccountCard = document.querySelector('.create-account-card');

    hideAllCards(cards);

    createAccountCard.classList.remove('is-hidden');
}