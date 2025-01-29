const admin = require('firebase-admin');
const serviceAccount = require('../firebase-sk.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotificationToDevice = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('Error enviando notificación:', error);
    return { success: false, error: error.message };
  }
};

const sendNotificationToMultipleDevices = async (tokens, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    return { success: true, response };
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
};