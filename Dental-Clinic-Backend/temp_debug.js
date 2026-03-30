const mongoose = require('mongoose');
const Appointment = require('./src/models/appointment');
const HealthProfile = require('./src/models/healthProfile');
const Patient = require('./src/models/patient');
const Account = require('./src/models/account');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/Healthcare');
    const patientAccount = await Account.findOne({ email: 'patient1@healthcare.vn' });
    const patient = await Patient.findOne({ accountId: patientAccount._id });
    const hp = await HealthProfile.findOne({ ownerId: patient._id });
    const app = await Appointment.findOne({ booker_id: patient._id });
    console.log({ patientId: patient._id.toString(), hp: hp?._id?.toString(), appointment: app?._id?.toString(), appointmentDate: app?.appointmentDate, status: app?.status });
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();