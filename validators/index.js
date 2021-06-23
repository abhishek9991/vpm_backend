const Joi = require('joi');

//login validator
exports.loginValidator = (req, res, next) => {
  const data = req.body;
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email(),

    password: Joi.string()
      .min(6)
      .required()
  });
  const { error } = schema.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  } else {
    next();
  }
}


