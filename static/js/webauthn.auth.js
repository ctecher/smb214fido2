'use strict';

/* Handle for register form submission */
// id du formulaire 
$('#register').submit(function(event) {
    alert("ennregistrement en cours");
    event.preventDefault();

    let username = this.username.value;
    let name     = this.name.value;

    if(!username || !name) {
        alert('Name or username is missing!')
        return
    }

})

        
let getMakeCredentialsChallenge = (formBody) => {
    // fetch permet de lancer une requete pour récupérer des ressources sur le réseau
    //https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch
    return fetch('/webauthn/register', {
        // rrequte POST
        method: 'POST',
        credentials: 'include',
        // c'est une requete JSON
        headers: {
          'Content-Type': 'application/json'
        },
        // encodage de l'objet JS fiormbody fourni en parametre en JSON
        body: JSON.stringify(formBody)
    })
    // reponse du serceur en JSON
    .then((response) => response.json())
    .then((response) => {
        // le status de la reponse est OK ou failed
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}