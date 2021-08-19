const jwt = require('jsonwebtoken');

//bloc try catch pour gerer les erreurs
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Utilisateur non valide !';
    } else {
      //si tout est bon, on peu passer la requete au prochain middleware
      next();
    }
  } catch {
    res.status(401).json({
      //probleme d'authentification
      error: new Error('Requete non authentifiee!')
    });
  }
};