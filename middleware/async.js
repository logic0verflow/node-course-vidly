module.exports = function asyncMiddleware(handler) {
  return (req, res, next) => {
    handler(req, res, next)
      .catch(ex => next(ex));
  };
}
