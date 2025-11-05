// Retourne un objet avec comme message et data les valeurs passées en parametre de la fonction
const success = (message, data) => {
  return {
    message: message,
    data: data,
  };
};

export { success };
