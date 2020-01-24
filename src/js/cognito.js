import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';

import * as AWS from 'aws-sdk/global';

const debug = false;

const poolData = {
    UserPoolId: process.env.COGNITO_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
}

const userPool = new CognitoUserPool(poolData);


let cognitoUser = {};


let constructCognitoUser = (username, userPool) => {
    let userData = {
        Username: username,
        Pool: userPool
    };

    return new CognitoUser(userData);
};


exports.signupUser = (username, password, callback) => {
    userPool.signUp(username, password, [], null, function (
        err,
        result
    ) {
        if (err) {
            if (typeof callback === 'function') {
                callback({
                    error: err
                });
            }
        }

        cognitoUser = result.user;

        if (result.user && result.user.authenticationFlowType === 'USER_SRP_AUTH') {
            if (typeof callback === 'function') {
                callback({
                    result: 'SUCCESS'
                });
            }
        } else {
            if (typeof callback === 'function') {
                callback({
                    result: 'FAIL'
                });
            }
        }

        if (debug === true) {
            console.log(result);
        }
        
    });
};


exports.confirmCodeEntry = (code_val, callback) => {
    cognitoUser.confirmRegistration(code_val, true, function (err, result) {
        if (err) {
            if (typeof callback === 'function') {
                callback({
                    error: err
                });
                return;
            }
        }
    
        if (result === 'SUCCESS') {
            callback({
                result: result
            });
        }

        if (debug === true) {
            console.log(result);
        }
    });
};


exports.attemptLogin = (username, password, callback) => {
    let authenticationData = {
        Username: username,
        Password: password
    };

    let authenticationDetails = new AuthenticationDetails(authenticationData);

    if (!cognitoUser || !cognitoUser.Username) {
        cognitoUser = constructCognitoUser(username, userPool);
    }

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

            AWS.config.credentials.refresh(err => {
                if (err) {
                    if (typeof callback === 'function') {
                        callback({
                            error: err
                        })
                    }
                } else {
                    if (typeof callback === 'function') {
                        callback({
                            result: 'SUCCESS'
                        })
                    }
                }
            })
        },
        onFailure: (err) => {
            if (debug === true) {
                console.log('onFailure err');
                console.log(err)
            }

            if (typeof callback === 'function') {
                callback({
                    fail: err
                })
            }
        }
    });
}