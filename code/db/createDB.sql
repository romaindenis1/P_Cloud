CREATE DATABASE IF NOT EXIST passion-lecture

CREATE TABLE t_utilisateur(
   user_id INT AUTO_INCREMENT,
   password VARCHAR(256),
   pseudo VARCHAR(50) NOT NULL,
   dateEntree DATE NOT NULL,
   isAdmin BOOLEAN NOT NULL,
   PRIMARY KEY(user_id),
   UNIQUE(pseudo)
);

CREATE TABLE t_categorie(
   categorie_id INT AUTO_INCREMENT,
   nom VARCHAR(50) NOT NULL,
   PRIMARY KEY(categorie_id)
);

CREATE TABLE t_auteur(
   auteur_id INT AUTO_INCREMENT,
   nom VARCHAR(50) NOT NULL,
   prenom VARCHAR(50) NOT NULL,
   PRIMARY KEY(auteur_id)
);

CREATE TABLE t_editeur(
   editeur_id INT AUTO_INCREMENT,
   nom VARCHAR(50) NOT NULL,
   PRIMARY KEY(editeur_id)
);

CREATE TABLE t_livre(
   livre_id INT AUTO_INCREMENT,
   titre VARCHAR(50) NOT NULL,
   nbPages INT NOT NULL,
   extrait VARCHAR(150),
   resume TEXT NOT NULL,
   anneeEdition DATE NOT NULL,
   _imageCouverture BLOB,
   editeur_fk INT NOT NULL,
   categorie_fk INT NOT NULL,
   auteur_fk INT NOT NULL,
   PRIMARY KEY(livre_id),
   UNIQUE(extrait),
   FOREIGN KEY(editeur_fk) REFERENCES t_editeur(editeur_id),
   FOREIGN KEY(categorie_fk) REFERENCES t_categorie(categorie_id),
   FOREIGN KEY(auteur_fk) REFERENCES t_auteur(auteur_id)
);

CREATE TABLE t_donner(
   livre_fk INT,
   user_fk INT,
   note INT NOT NULL,
   PRIMARY KEY(livre_fk, user_fk),
   FOREIGN KEY(livre_fk) REFERENCES t_livre(livre_id),
   FOREIGN KEY(user_fk) REFERENCES t_utilisateur(user_id)
);

CREATE TABLE t_commenter(
   livre_fk INT,
   user_fk INT,
   contenu TEXT,
   PRIMARY KEY(livre_fk, user_fk),
   FOREIGN KEY(livre_fk) REFERENCES t_livre(livre_id),
   FOREIGN KEY(user_fk) REFERENCES t_utilisateur(user_id)
);

