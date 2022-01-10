# SMB214 - FIDO 2
## Déploiement de l’application de démonstration
## Ressources utilisées

#### FIDO Alliance WebAuthn demo

Slides: https://slides.com/fidoalliance/jan-2018-fido-seminar-webauthn-tutorial#/

Dépôt : https://github.com/fido-alliance/webauthn-demo/

## 1. Téléchargement de l’application de démonstration

### Méthode 1 - Depuis le site Github
- Téléchargez le dépôt du projet à l’URL suivante et décompressez l’archive dans le dossier de votre choix : 
https://github.com/ctecher/smb214fido2.git

### Méthode 2 - Utilisation de l’application Git
- Installez Git dans votre environnement de travail : 
- Lien : https://git-scm.com/ 

Dans le dossier de votre choix, cloner le dépôt https://github.com/ctecher/smb214fido2.git :
- COMMANDE SHELL 
```Bash
dossier$ git clone https://github.com/ctecher/smb214fido2.git
```

## 2. Installation de l’application (ordinateur physique ou VM)
La création de l’application de démonstration FIDO2 dans une VM nécessite :
- D’installer les sources de l’application comme montré précédemment.
- De configurer le site web en HTTPS.
- De modifier certains fichiers de l’application.
- De créer un enregistrement dans le fichier hosts de votre ordinateur.

Ressources pour la configuration d'un serveur nodejs en HTTPS : https://blog.goovy.io/running-a-nodejs-server-with-https/

### Prérequis
Il faut installer les logiciels suivants : 
•	NodeJS
•	NPM
•	OpenSSL
•	Un navigateur Internet (Chrome, Edge, Firefox ou Safari)

`Remarque`
`Pour ceux qui souhaite installer NodeJS sur Windows, un fichier MSI est mis à disposition sur le site officiel et permet d’installer à la fois NodeJS et NPM.`

### Installation de l’application
Si vous avez utilisé la méthode 1 pour récupérer les sources, vous devez décompresser le fichier puis déposer le répertoire **smb214fido-master** à l’emplacement de votre choix.

### Génération d'une clé privée et d'un certificat
Dans le cadre de cette application, on va créer une clé privée ainsi qu’un certificat auto-signé. L’outil OpenSSL est nécessaire pour réaliser les étapes suivantes.

#### Etape 1) On crée la clé privée :
- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ openssl genrsa -out key.pem
```
#### Etape 2) On crée un fichier de requête de signature de certificat
- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ openssl req -new -key key.pem -out csr.pem
```

- Renseignez les informations demandées, leur valeur n’a aucune importance SAUF pour le champ Commun Name qui va servir pour l’url HTTPS de notre application.

Dans le cadre de cette exemple, vous pouvez par exemple choisir : **fido2.smb214.cnam.local**

#### Etape 3) On génère le certificat auto-signé à l’aide du fichier CSR
- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```
#### Etape 4) On dépose les fichiers key.pem et cert.pem dans le répertoire contenant les sources de l’application.
![fichiershttps](./static/img/vm_01.png)

### Modification de l’application
Par défaut, l’application n’a pas été configurée pour fonctionner avec le protocole HTTPS. De plus, il est nécessaire que l’on configure notre application pour qu’elle réponde avec l’url https://fido2.smb214.cnam.local

#### Etape 1) On modifie le fichier app.js de la façon suivante afin que l’application puisse démarrer en HTTPS :

- Ajoutez ces lignes de code juste après la ligne 18 du fichier app.js

- FICHIER APP.JS 
```Javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
```
- Retirez les commentaires à la ligne 46 et mettez en commentaires les lignes 47 à 50.
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
#### Etape 2) On modifie le fichier config.json afin de modifier le port d’écoute indiquer l'origin avec l'url précédemment choisi en incluant le HTTPS et le numéro de port

- FICHIER CONFIG.JSON 
```Javascript
{
    "port": 3000,
    "origin": "https://fido2.smb214.cnam.local:3000"
}
```

`Remarque`
`Rien ne vous empêche d’écouter sur un autre n° de port. Toutefois n’oubliez pas de vérifier que ce numéro soit identique dans le fichier config.jon et app.js.`

### Démarrage de l’application
Positionnez-vous dans le répertoire contenant les sources de l’application et exécutez les commandes suivantes. Pour information, la commande node app permet de démarrer l’application. 

- COMMANDE SHELL 
```Bash
dossier/smb214fido2$ npm install
dossier/smb214fido2$ node app
```
### Configuration du fichier hosts
Afin d’être en mesure de joindre l’application avec l’url en HTTPS, il est nécessaire de configurer soit votre serveur DNS, soit votre fichier hosts.

#### Etape 1) On récupère l’adresse IP de votre machine (ipconfig ou ip -4).

#### Etape 2) On ajout une ligne dans le fichier hosts sur la machine depuis laquelle vous souhaitez joindre l’application.
 
- FICHIER HOSTS 
```Bash
192.168.0.4	fido2.smb214.cnam.local
```

`Remarque`
`Sur Windows, le fichier hosts est stocké dans le répertoire C:\Windows\System32\drivers\etc. Gardez en tête que vous devez ouvrir votre éditeur de texte en tant qu’administrateur pour pouvoir enregistrer les modifications.`


### Accès l’application
Depuis votre navigateur, saisissez l'url https://fido2.smb214.cnam.local:3000 (ignorez le risque de sécurité, c'est normal car vous avez généré un certificat autosigné).

![appweb](./static/img/appweb_01.png)

## 3. Création de l’application dans le cloud Azure en mode PaaS (App service)
Si vous souhaitez installer l’application de démonstration sur Microsoft Azure, il suffit de suivre les instructions qui suivent.

### Les prérequis
L’installation d’une application Web comme App Service dans Azure nécessite:
- De disposer d’un **compte Azure** -> utilisez votre compte étudiant du CNAM ;
- De disposer d’un **abonnement Azure** pour gérer les coûts et les ressources déployées. Vous utili-serez l’abonnement ADT4T de votre compte étudiant du CNAM qui vous permet de bénéficier d’un crédit de 100 $ (voir document FIDO2_ActiverCréditAzureEtudiant.docx pour activer votre pass) ;
- De choisir un **Plan App Service** qui détermine les caractéristiques et les performances des serveurs virtuels qui vont exécuter votre Application Web ; le plan tarifaire le plus bas peut être utilisé ce qui n’engendrera aucun coût sur votre pass ;
- De créer un **groupe de ressources Azure** pour regrouper et organiser les ressources nécessaires au service Web ;
- De créer les **ressources Azure** nécessaires au service Web dans ce groupe de ressources ;
- De créer et d’utiliser un **compte de déploiement** en relation avec le protocole FTP ou Git. C’est le protocole Git qui est utilisé dans ce document.

`INFORMATION`
`Vous pouvez utiliser le même compte de déploiement créé pour tous vos déploiements Azure. Le nom d’utilisateur et le mot de passe du compte de déploiement sont différents de votre compte Azure qui vous  permet de vous identifier sur Azure.`

![ressourcesazure](./static/img/azure_01.png)
 
La création de l’application se fait :
- En utilisant le **portail Azure** ou **Azure Cloud Shell**.
- En déployant le code de l’application depuis son ordinateur local grâce à **Git**.

`INFORMATION`
`Azure Cloud Shell est un environnement d’interpréteur de commandes interactif utilisable dans votre navigateur. Il n’y a alors aucun logiciel à installer et à configurer sur votre ordinateur.`
`Cet environnement permet de configurer et d’utiliser les services Azure avec choisissant Bash ou PowerShell pour lancer et exécutez vos commandes.`

### Mise en place de l’application dans le Cloud Azure
Le déploiement de votre application dans Azure comme App Service se fait en suivant les étapes suivantes :
- Création d’un compte utilisateur de déploiement :  pour ce tutoriel il s’agit de **smb214** mot de passe **[Cnam1234\*]** mais vous pouvez indiquer vos propres informations ;
- Création d’un groupe de ressources appelé par exemple  **smb214GroupeRessources** à l’emplacement **France Central** ; si aucun instance n’est pas disponible lors de la création du service, choisissez une autre localisation de Datacenter ;
- Création du plan Azure Service **smb214PlanAppService** avec le niveau **tarifaire Gratuit (FREE)** dans le groupe de ressource **smb214GroupeRessources** ; 
- Création de l’application Web Node.JS avec un nom doit être **unique** dans Azure, le moteur de script **Node.JS 12.4**,  le plan Azure Service **smb214PlanAppService** dans le groupe de ressource **smb214GroupeRessources** le déploiement **Git activé**. Dans ce document le nom choisi **smb214fido2ct** est mais **vous devez en utiliser un autre**. 

### Création de l’application Web depuis le portail Azure
-	Se connecter au portail Azure à l’URL : https://portal.azure.com
-	Dans le portail Azure choisissez le Web App Services service et cliquez sur le bouton **Créer une App service**. Si vous ne trouvez pas ce service utiliser la zone de recherche.

![portailazure](./static/img/azure_02.png)

Avez votre compte étudiant, vous disposez de l’abonnement Azure pour les étudiants.

Vous devez maintenant précisez le groupe de ressources de votre application Web, soit un groupe existant visible dans la liste ou créer un nouveau groupe de ressources.

Pour créer un nouveau groupe de ressources appelé **smb214GroupeRessources** cliquez sur le lien **Créer nouveau** saisissez le nom **smb214GroupeRessources**  et validez avec le bouton **OK** :

Précisez ensuite :
- le nom de votre application web qui doit être unique dans Azure : **smb214fido2ct** ; une coche verte doit s’afficher pour indiquer que ce nom n’a pas encore été utilisé ;
- La pile d’exécution **NODE 12 LTS** avec le système d’exploitation **Linux** ;
- la région du datacenter qui va héberger votre application : France Central ;


Créez ensuite un plan Azure Service nommé **smb214PlanAppService** avec le niveau **tarifaire Gratuit F1  (FREE)** que vous pouvez sélectionner en cliquant sur le lien **Changer la taille** :

Cliquez sur le bouton **[Vérifier  + Créer]**. Cela affiche un résumé de vos options et vous pouvez alors valider en cliquant sur le bouton **Créer**.
 
![creerwaeapp](./static/img/azure_03.png)

Votre application est maintenant visible parmi la liste de vos App Service. Si nécessaire actualiser la page :

En sélectionnant votre application, la page **Vue d’ensemble** s’affiche et vous permet d’exécuter des tâches de gestion de base telles que **Parcourir, Arrêter, Redémarrer et Supprimer**.

Vous visualisez également : 
- le nom du groupe de ressources : **smb214GroupeRessources** ; 
- l’URL publique de votre serveur Web : https://smb214fido2ct.azurewebsites.net  ;
- Le plan App Service : **smb214PlanAppService** ;
- Le nom d’utilisateur de déploiement avec le protocole FTP : **smb214fido21ct\comComptex** ; 

Pour activer le déploiement avec Git local cliquez dans la colonne de gauche sur **Centre de déploiement** puis la source Git local et enregistrez :

![Prérequis](./static/img/azure_04.png) 

Cliquez sur **Enregistrer**.

Puis ensuite dans l’onglet **Informations d’identification FTPS/Git** renseignez dans la partie **Etendue d’utilisateur** le nom de compte de déploiement de votre choix et le mot de passe. Dans ce document il s’agit de  **smb214** mot de passe **[Cnam1234*]**.

Enregistrez vos modifications.
 
![comptedeploiement](./static/img/azure_05.png)

L’URL du dépôt git sur Azure qui permettra la publication de votre code est affichée. 
Pour cet exemple l’URL est : https://smb214fido2ct.scm.azurewebsites.net:443/smb214fido2ct.git

Le port réseau peut être omis car il s’agit du port SSL par défaut : 
https://smb214fido2ct.scm.azurewebsites.net/smb214fido2ct.git

l’URL du Git distant Azure qui permettra d’envoyer votre code dans l’App Service : https://smb214:Cnam1234*@smb214fido2ct.scm.azurewebsites.net/smb214fido2ct.git.


l’URL de l’application : dans ce tutoriel smb214fido2ct.azurewebsites.net ;

Testez avec votre navigateur que vous accédez bien à l’application (vide pour l’instant)

![Prérequis](./static/img/azure_06.png) 

### Envoyer le code de l’application (push) avec Git

Avant d’envoyer votre code vers la Web App dans Azure il est indispensable de modifier le fichier config.json d’application locale afin de renseigner correctement l’origine du site Web

- CONTENU DU FICHIER CONFIG.JSON AVANT MODIFICATION
```Bash  
{
    "port": 3000,
    "origin": "http://localhost:3000"
} 
```

- CONTENU DU FICHIER CONFIG.JSON APRES MODIFICATION  
```Javascript
{
    "port": 3000,
    "origin": "https://smb214fido2ct.azurewebsites.net"
} 
```

- La **branche de déploiement** par défaut pour votre application App Service est **master**.
- Ajoutez le **dépôt distant Azure** de votre App Service dans votre dépôt Git local en précisant le **compte de déploiement** et le **mot de passe** du compte de déploiement : 

- COMMANDE SHELL DANS LE TERMINAL DE VOTRE VM DEBIAN  
```Bash
dossier/smb214fido2$ git remote add azure https://smb214:Cnam1234*@smb214fido2ct.scm.azurewebsites.net/smb214fido2ct.git
```

- Envoyer votre code vers le dépôt distant Azure de l’application Web smb214fido2ct en utilisant la commande PUSH de Git 
- COMMANDE SHELL DANS LE TERMINAL DE VOTRE VM DEBIAN  
```Bash
dossier/smb214fido2$ git push azure
```

L’exécution de la commande peut prendre quelques secondes …

En accédant à votre Web App, vous pouvez visualiser l’application et la tester :

![Prérequis](./static/img/azure_07.png) 

### Envoyer des modifications du dépôt local sur l’application Web app dans Azure avec Git

Si vous avez des modifications à apporter à la Web App utiliser les commandes suivantes pour les valider localement avant de les pousser dans Azure
- COMMANDE SHELL  
```Bash
dossier/smb214fido2$ git add .
dossier/smb214fido2$ git commit -m "maj config"
dossier/smb214fido2$ git push azure 
```
