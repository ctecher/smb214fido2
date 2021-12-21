const express  = require('express');
const utils    = require('../utils');
const router   = express.Router();
const database = require('./db');

/* Returns if user is logged in */
router.get('/isLoggedIn', (request, response) => {
    //console.log("test");
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed'
        })
    } else {
        response.json({
            'status': 'ok'
        })
    }
})

/* Logs user out */
router.get('/logout', (request, response) => {
    request.session.loggedIn = false;
    request.session.username = undefined;

    response.json({
        'status': 'ok'
    })
})

/* Returns personal info and THE SECRET INFORMATION */
router.get('/personalInfo', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed',
            'message': 'Access denied'
        })
    } else {
        //ct changer image selon FIDO2 activé ou pas
        
        
        if (database[request.session.username].fido2) {
            image = '<img width="250px" src="img/fido2.jpg">';
        
        } else {
            image = '<img width="250px" src="img/passwordauth.png">';
        }
        
        
        response.json({
            'status': 'ok',
            'name': database[request.session.username].name,
            //ct
            //'theSecret': '<img width="250px" src="img/theworstofthesecrets.jpg">'
            'theSecret': image
        })
    }
})

module.exports = router;
