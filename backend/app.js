//importations
const express = require ('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const SauceRoutes = require('./routes/Sauce');
const userRoutes = require('./routes/user');

//connexion de l'API à mongoDB que j'ai cree
mongoose.connect('mongodb+srv://Fatoumata:maman94@cluster0.ehbhl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//creation de l'app
const app = express();

//middleware general 1 pour definir les headers de toutes les requetes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//body parser qui transforme le corps de la requete en un objet gerable
app.use(bodyParser.json());

// middleware qui permet l'accès statique à des images _dirname= nom du dossier
app.use('/images', express.static(path.join(__dirname, 'images')));

// Utilisation des routes
app.use('/api/sauces', SauceRoutes);
app.use('/api/auth', userRoutes);

// Exportation de l'app pour utilisation par d'autres fichiers, nottament le serveur Node.
module.exports = app; 