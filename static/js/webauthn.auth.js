'use strict';

/* Handle for register form submission */
// id du formulaire 
$('#register').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let name     = this.name.value;

    if(!username || !name) {
        alert('Nom ou nom utilisateur non renseigné !')
        return
    }

    // lancement d'un défi
    getMakeCredentialsChallenge({username, name})
        .then((response) => {
            let publicKey = preformatMakeCredReq(response);
            console.log("publickey du navigateot.create");
            console.log(publicKey);
            return navigator.credentials.create({ publicKey })
        })
        /*
        .then((newCred) => {
            // nmise à jour pour buffer diapo 24
            console.log("navigateur creation credentials et enregistrement après buffer")   ;
            let makeCredResponse = publicKeyCredentialToJSON(newCred);
            console.log(makeCredResponse)   
        })
        */
       .then((response) => {
           console.log("après navigator create");
           console.log(response);
           let makeCredResponse = publicKeyCredentialToJSON(response);
           return sendWebAuthnResponse(makeCredResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Le serveur repond avec uen erreur. Le message est : ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})

        
let getMakeCredentialsChallenge = (formBody) => {
    // formbody contient username et nom
    // fetch permet de lancer une requete pour récupérer des ressources sur le réseau
    //https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch
    return fetch('/webauthn/register', {
        // requete POST
        method: 'POST',
        credentials: 'include',
        // c'est une requete JSON
        headers: {
          'Content-Type': 'application/json'
        },
        // encodage de l'objet JS formbody fourni en parametre en JSON : contient username et name
        body: JSON.stringify(formBody)
    })
    // reponse du serveur en JSON
    .then((response) => response.json())
    .then((response) => {
        // le status de la reponse est OK ou failed
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}


let sendWebAuthnResponse = (body) => {
    return fetch('/webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

//diapo 38
let getGetAssertionChallenge = (formBody) => {
    return fetch('/webauthn/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Le Serveur repond avec une erreur . Le message est : ${response.message}`);

        return response
    })
}

//Diapo 39
/* Handle for login form submission */
$('#login').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;

    if(!username) {
        alert('Le nom utilisateur est manquant !')
        return
    }

    getGetAssertionChallenge({username})
        .then((response) => {
            let publicKey = preformatGetAssertReq(response);
            return navigator.credentials.get({ publicKey })
        })
        .then((response) => {
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            return sendWebAuthnResponse(getAssertionResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Le serveur repond avec une erreur. Le message est : ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})