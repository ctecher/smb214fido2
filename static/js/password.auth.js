/* Handle for register form submission */
$('#register').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let password = this.password.value;
    let name     = this.name.value;
    //ct
    let fido2    = this.fido2.checked;
    //
    // ct
    /*

    if(!username || !password || !name) {
         alert('Nom , login utilisateur ou mot de passe manquant !')
        return
    }
    */
    

    if ( !username || !name ) {
        alert('Nom ou login utilisateur manquant !')
        return
    } 

    if ( username && name && !password && !fido2) {
        alert('Not de passe nécesaire pour  pour une authentification classique !')
        return
    }

    //ct
    //let formBody = {username, password, name}; 
    let formBody = {username, password, name, fido2}; 

    fetch('/password/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status === 'ok') {
            loadMainContainer()
        } else {
            alert(`Server responed with error. The message is: ${response.message}`);
        }
    })
})

/* Handle for login form submission */
$('#login').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let password = this.password.value;

    if(!username || !password) {
        alert('Username or password is missing!')
        return
    }

    let formBody = {username, password}; 
    fetch('/password/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status === 'ok') {
            loadMainContainer()   
        } else {
            alert(`Server responed with error. The message is: ${response.message}`);
        }
    })
})


