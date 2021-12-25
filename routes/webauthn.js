const express   = require('express');
const utils     = require('../utils');
const config    = require('../config.json');
const base64url = require('base64url');
const router    = express.Router();
const database  = require('./db');

/* ---------- ROUTES START ---------- */
router.post('/register', (request, response) => {
    // verifier que le champs sont renseignes
    if(!request.body || !request.body.username || !request.body.name) {
        response.json({
            'status': 'failed',
            'message': 'Request missing name or username field!'
        })

        return
    }

    let username = request.body.username;
    let name     = request.body.name;

    // verifeir que l'utilisaetiur n'existe pas ou qu'il n'est déjà enregistre"
    if(database[username] && database[username].registered) {
        response.json({
            'status': 'failed',
            'message': `Username ${username} already exists`
        })

        return
    }

    // creation de l'utilisateur comme non enregistre
    console.log("Serveur : creation utilisateur");
    database[username] = {
        'name': name,
        'registered': false,
        //generation d'un ID aleatoire
        'id': utils.randomBase64URLBuffer(),
        //stockage des authentificateurs enregistres
        'authenticators': []
    }
    console.log("Serveur database user: " + JSON.stringify(database));
    
    //generer un defi makeCred en trsnamettant le username, nom et l'identifiant
    let challengeMakeCred    = utils.generateServerMakeCredRequest(username, name, database[username].id)
    // indiquer au navigateur que vous allez bien
    challengeMakeCred.status = 'ok'
    //ajout des infos que l'on veut à response
    //challengeMakeCred.test = 'Charles Techer'
    
    // rnregistremetn dasn la session du username et du challenge pour polus trad
    request.session.challenge = challengeMakeCred.challenge;
    request.session.username  = username;
    
    // affichage des infos au niveau du navigateur dans la console ? reseigner la variable response qui est envoyé au navigateur ?
    // faire en sorte de les afficher dans le navigateur
    // envoyer une reposne au navigateur
    response.json(challengeMakeCred);
    //console.log("Serveur challengeMakeCred : " + JSON.stringify(challengeMakeCred));
    
})


router.post('/response', (request, response) => {
    if(!request.body       || !request.body.id
    || !request.body.rawId || !request.body.response
    || !request.body.type  || request.body.type !== 'public-key' ) {
        response.json({
            //verification de la reponse
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        })

        return
    }

    let webauthnResp = request.body
    //analyse des données clioent
    let clientData   = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON));
    console.log("test");
    console.log("clientData : ");
    console.log(clientData);
    console.log("request.session.challenge : " + request.session.challenge);
    console.log("config.origin : " + config.origin);

    /* Check challenge... */
    if(clientData.challenge !== request.session.challenge) {
        response.json({
            'status': 'failed',
            //verification correspondance origine
            'message': 'Challenges don\'t match!'
        })
    }

    /* ...and origin */
    if(clientData.origin !== config.origin) {
        response.json({
            'status': 'failed',
            //verification correspondance defi
            'message': 'Origins don\'t match!'
        })
    }

    //diapo 28
    
    //if(webauthnResp.response.attestationObject !== undefined) {
    //    /* This is create cred */

    //} else if(webauthnResp.response.authenticatorData !== undefined) {
    //    /* This is get assertion */
        
    //} else {
    //    response.json({
    //        'status': 'failed',
    //        'message': 'Can not determine type of response!'
    //    })
    //}
    
   //diapo 32
   
   let result;
   if(webauthnResp.response.attestationObject !== undefined) {
       /* This is create cred */
       result = utils.verifyAuthenticatorAttestationResponse(webauthnResp);

       if(result.verified) {
           database[request.session.username].authenticators.push(result.authrInfo);
           database[request.session.username].registered = true
       }
   } else if(webauthnResp.response.authenticatorData !== undefined) {
       /* This is get assertion */
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not determine type of response!'
        })
    }
    if(result.verified) {
        request.session.loggedIn = true;
        response.json({ 'status': 'ok' })
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not authenticate signature!'
        })
    }


})

/* ---------- ROUTES END ---------- */

module.exports = router;
