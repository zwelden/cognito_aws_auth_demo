import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';

import * as AWS from 'aws-sdk/global';


const debug = true;

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
                return;
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

    console.log(username);
    console.log(password);

    let authenticationDetails = new AuthenticationDetails(authenticationData);

    if (!cognitoUser || !cognitoUser.Username) {
        cognitoUser = constructCognitoUser(username, userPool);
    }

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            let accessToken = result.getAccessToken().getJwtToken();

            AWS.config.region = process.env.AWS_REGION;

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


exports.rememberDevice = (callback) => {
    cognitoUser.setDeviceStatusRemembered({
        onSuccess: (res) => {
            if (typeof callback === 'function') {
                callback({
                    result: res
                });
            }
        },
        onFailure: (err) => {
            if (typeof callback === 'function') {
                callback({
                    error: err
                });
            }
        }
    });
}


exports.setCognitoUserFromSession = (callback) => {
    cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
            if (err) {
                if (typeof callback === 'function') {
                    callback({
                        error: err
                    });

                    return;
                }
            }

            if (debug === true) {
                console.log('session validity: ' + session.isValid());
                console.log(session);
            }

            cognitoUser.getUserAttributes((err, attributes) => {
                if (err) {
                    if (debug === true) {
                        console.log(err);
                    }
                } else {
                    // Do something with attributes
                }
            });

            let credentials_obj = {
                Logins: {}
            };
            credentials_obj.Logins['cognito-idp.'+ process.env.AWS_REGION +'.amazonaws.com/' + process.env.COGNITO_POOL_ID] = session.getIdToken().getJwtToken();
            credentials_obj.IdentityPoolId = process.env.IDENTITY_POOL_ID;

            console.log(credentials_obj);

            AWS.config.region = process.env.AWS_REGION;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials_obj);
            

            AWS.config.credentials.refresh(err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(AWS.config.credentials);
                }
            })

            // instantiate service objects

            if (typeof callback === 'function') {
                callback({
                    result: 'SUCCESS'
                });
            }
        });
    }
}


exports.getUserCredentials = () => {
    return AWS.config.credentials;
}

exports.signOut = () => {
    cognitoUser.signOut();
}