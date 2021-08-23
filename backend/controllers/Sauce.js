// Importations
const Sauce = require('../models/Sauce');

//fs signifie « file system » (soit « système de fichiers » en français). 
//Il nous donne accès aux fonctions qui nous permettent de modifier le système de fichiers, y compris aux fonctions permettant de supprimer les fichiers.
const fs = require('fs');

//exportations de méthodes pour les routes 

//creer une sauce
exports.createSauce = (req, res, next) => {
  //modifier rout post
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce= new Sauce({
  ...sauceObject,
  likes: 0,
  dislikes: 0,
  usersLiked: [],
  usersDisliked: [],
  //recuperation du segment de base de l'url
  imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  //enregistrement de la sauce
  console.log(sauce);
  sauce.save()
  //renvoyer une reponse positive sinon la requete du front va expirer
  .then(() => res.status(201).json({message: 'Objet enregistré !'}))
  //error = raccourci js de error : error 
  .catch((error) => res.status(400).json({ error }));
  console.log(error);
};

//modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  { 
    //transformer en objet js
    ...JSON.parse(req.body.sauce),
    //changement de l'url
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ... req.body};
  //mettre a jour la sauce
  Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
  .then(() => res.status(200).json({message: 'Objet modifié !'})) 
  .catch(error => res.status(400).json({ error }));
};

//supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  //Rechercher dans la base de données le produit par l'id
  Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      //extraction du nom du fichier a supprimer
      const filename = sauce.imageUrl.split('/images/')[1];
      //supprimer image
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({_id: req.params.id})
        //supprimer l'objet dans la base de donnees
        .then(() => res.status(200).json({message: 'deleted!'}))
        .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


//afficher une seule sauce
exports.getOneSauce = (req, res, next) => {
  // comparaison entre l'_id du paramètre url et l'id de l'objet envoyé par mongoDB
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => res.status(200).json( sauce ))
  .catch(error => res.status(404).json({ error }));
};


//afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({ error }));
};

// Liker ou Disliker une sauce
exports.likeSauce = (req, res, next) => {
  // si un user like ou dislike une sauce:
  // maj le nombre de likes ou de dislikes
  // maj les tableaux des users qui ont liké ou disliké
  const user = req.body.userId;
  const likeValue = req.body.like;

  if (likeValue === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersLiked: user }, $inc: { likes: +1 } }
    )
      .then(() => res.status(201).json({ message: "Sauce aimée ! " }))
      .catch((error) => {
        console.log(error.message);
        return res.status(500).json({ error });
      });
  } else if (likeValue === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersDisliked: user }, $inc: { dislikes: +1 } }
    )
      .then(() => res.status(201).json({ message: "Sauce détestée ! " }))
      .catch((error) => {
        console.log(error.message);
        return res.status(500).json({ error });
      });
  } else if (likeValue === 0) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.includes(user)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersLiked: user },
              $inc: { likes: -1 },
            }
          )
            .then(() =>
              res
                .status(200)
                .json({ message: "Vous n'aimez plus cette sauce !" })
            )
            .catch((error) => res.status(500).json({ error }));
        }
        if (sauce.usersDisliked.includes(user)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: user },
              $inc: { dislikes: -1 },
            }
          )
            .then(() =>
              res
                .status(200)
                .json({ message: "Vous ne détestez plus cette sauce !" })
            )
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};

