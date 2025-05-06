
const Joi = require('joi');

const directQuestionSchema = Joi.object({
  exam_id: Joi.string().required(),
  question_type: Joi.string().valid('direct').required(),
  content: Joi.string().required(),
  answer_text: Joi.string().required(), 
  tolerance_rate: Joi.number().min(0).max(100),
  duration: Joi.number().min(1).required(),
  score: Joi.number().min(0).required()
});

const qcmQuestionSchema = Joi.object({
  exam_id: Joi.string().required(),
  question_type: Joi.string().valid('qcm').required(),
  content: Joi.string().required(),
  options: Joi.array().items(
    Joi.object({
      option_text: Joi.string().required(),
      is_correct: Joi.boolean().required()
    })
  ).min(2).required(),
  duration: Joi.number().min(1).required(),
  score: Joi.number().min(0).required()
});

module.exports = {
  createQuestion: (data) => {
    return data.question_type === 'direct' 
      ? directQuestionSchema.validate(data)
      : qcmQuestionSchema.validate(data);
  }
};