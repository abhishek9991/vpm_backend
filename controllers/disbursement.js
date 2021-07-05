const Disbursement = require('../models/Disbursement');
const _ = require('lodash');
const { sendMail } = require('./email')

// create new disbursement
exports.createDisbursement = async (req, res) => {
  const disbursement = new Disbursement(req.body.disbursement);

  try {
    await disbursement.save();
    try {
      const emailResult = await sendMail({ emailData: { disbursement, emailFor: 'newDisbursement' } });
      if (emailResult.Error)
        return res.json({ msg: "successfully created disbursement", disbursement, emailMsg: 'failed to send email to student' });
      return res.json({ msg: "successfully created disbursement", disbursement, emailMsg: 'successfully sent email to student' });
    } catch (error) {
      return res.json({ msg: "successfully created disbursement", disbursement, emailMsg: 'failed to send email to student' });
    }
  } catch (error) {
    return res.status(400).json({ error, msg: "Failed to create disbursement" });
  }
}

//get all disbursement
exports.getAllDisbursements = async (req, res) => {
  try {
    const disbursements = await Disbursement.find({});
    if (!disbursements || disbursements.length === 0)
      return res.status(204).json({ error: "No disbursement record found." });
    res.json({ disbursements });
  } catch {
    res.status(400).json({ error, msg: "Failed to fetch disbursement" });
  }
}

//get specific disbursement
exports.getDisbursement = async (req, res) => {
  const { queryparams } = req.body;
  try {
    const disbursements = await Disbursement.find({ ...queryparams });
    if (!disbursements || disbursements.length === 0)
      return res.status(204).json({ error: "No disbursement record found." });
    res.json({ disbursements });
  } catch {
    res.status(400).json({ error, msg: "Failed to fetch disbursement" });
  }
}

//get all disbursement (for student)
exports.getStudentDisbursements = async (req, res) => {
  try {
    const disbursements = await Disbursement.find({ vpmId: req.user.vpmId });
    if (!disbursements || disbursements.length === 0)
      return res.status(204).json({ error: "No disbursement record found." });
    res.json({ disbursements });
  } catch {
    res.status(400).json({ error, msg: "Failed to fetch disbursement" });
  }
}

exports.editDisbursement = async (req, res) => {
  const { financialYear, disb_no } = req.body;
  try {
    let disbursement = await Disbursement.findOne({ financialYear, disb_no });
    if (!disbursement)
      return res.status(204).json({ error: "No disbursement record found." });
    disbursement = _.extend(disbursement, req.body.updatedDisbursement);
    await disbursement.save();
    res.json({ updatedDisbursement: disbursement });
  } catch {
    res.status(400).json({ error, msg: "Failed to edit disbursement" });
  }
}

exports.deleteDisbursement = async (req, res) => {
  const { financialYear, disb_no } = req.body;
  try {
    await Disbursement.deleteOne({ financialYear, disb_no });
    res.json({ msg: "Deleted disbursement" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error, msg: "Failed to delete disbursement" });
  }
}