# SMB214 Déploiement de l’application de démonstration FIDO2 
## Ressources utilisées

#### FIDO Alliance WebAuthn demo

Slides: https://slides.com/fidoalliance/jan-2018-fido-seminar-webauthn-tutorial#/

### Requirements

- Firefox Nightly ; Chrome, Edge 
- Nodejs + NPM
- Text editor

### Run

- `git clone https://github.com/fido-alliance/webauthn-demo/`
- `cd webauthn-demo`
- `npm install`
- `node app`

### Exposé SMB214

## Installation en local
# Prérequis
- Logiciels installés : Nodejs, NPM navigateur (Chrome, Edge ou Firefox).
	
# Téléchargement de l’application – méthode 1
- Téléchargez le dépôt du projet à l’URL suivante et décompressez l’archive dans le dossier de votre choix : 
https://github.com/ctecher/smb214fido2.git

# Téléchargement de l’application – méthode 2
- Installez Git dans votre environnement de travail : 
- Lien : https://git-scm.com/ 

Dans le dossier de votre choix, cloner le dépôt https://github.com/ctecher/smb214fido2.git :
- COMMANDE SHELL 
```Bash
dossier$ git clone https://github.com/ctecher/smb214fido2.git
```


# Mise en place de l’application
Installez les modules et lancez l’application :

- COMMANDE SHELL 
```Bash
dossier$ cd smb214fido2
dossier/smb214fido2$ npm install
dossier/smb214fido2$ node app
```
# Accès l’application
Depuis votre navigateur, accédez à l’URL 
http://localhost:3000

## Création de l’application dans une VM 
La création de l’application de démonstration FIDO2 dans une VM nécessite :
-	d’installer les sources de l’application comme montré précédemment ;
-	de configurer le site web en HTTPS ,
-	d’utiliser un nom DNS,
-	de créer un enregistrement dans le fichier hosts de votre ordinateur.

Ressources pour la configuration d'un serveur nodejs en HTTPS : https://blog.goovy.io/running-a-nodejs-server-with-https/

- Installez les sources comme montré précédemment (téléchargement de l’archive depuis Github ou bien utilisation de Git pour cloner le dépôt) 
# Générer une clé privée

- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ openssl genrsa -out key.pem
```

# Générer un certificat autosigné
- Créez la requête de demande se signature du certificat 
- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ openssl req -new -key key.pem -out csr.pem
```

- Renseignez les champs demandés et choisissez bien le Commun Name puisqu'il devra être utilisé comme URL.

Dans notre exemple, on a mis fido2.smb214.cnam.local

# Générez le certificat auto-signé 
- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```

- Vérifiez et si nécessaire déplacez les fichiers key.pem et cert.pem dans le répertoire où ou avez décompressé les sources de l'application.
 # Modification de l’application
- Ouvrez le fichier app.js
- Ajoutez ces lignes de code juste après la ligne 18 

- FICHIER APP.JS 
```Javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
```
- Décommentez la ligne 46 et mettez en commentaires les lignes 47 à 50.
- FICHIER APP.JS 
```Javascript
const port = config.port || 3000;
//const port = process.env.PORT || 3000;
//app.listen(port);
//console.log(`Lancement de l'application sur le port ${port}`);

//module.exports = app;
```

- Ajoutez ces lignes de code à la fin du script
- FICHIER APP.JS 
```Javascript
https.createServer(options, app).listen(port);
console.log(`Lancement de l'application sur le port ${port}`);
```

- Modifiez le fichier config.json pour modifier le port d’écoute indiquer l'origin avec l'url précédemment choi-si en incluant le HTTPS et le numéro de port => https://fido2.smb214.cnam.local:3000

- FICHIER CONFIG.JSON 
```Javascript
{
    "port": 3000,
    "origin": "https://fido2.smb214.cnam.local:3000"
}
```

# Mise en place de l’application dans la VM
- Installez les modules et lancez l’application :
- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ npm install
dossier/smb214fido2$ node app
```
# Configuration de votre ordinateur local pour accéder à l’application hébergée dans la VM
- Modifiez votre fichier hosts pour ajouter l'entrée suivante (renseigner l'adresse IP de votre serveur NodeJS) : 
- FICHIER HOSTS 
```Bash
192.168.0.4	fido2.smb214.cnam.local
```
# Accès l’application
Depuis votre navigateur, saisissez l'url https://fido2.smb214.cnam.local:3000 (ignorez le risque de sécurité, c'est normal car vous avez généré un certificat autosigné).
 
