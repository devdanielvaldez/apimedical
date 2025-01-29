const sendWhatsAppMessage = (number, msg) => {
    return new Promise((resolve, reject) => {
        axios
        .post('https://bot.drjenniferreyes.com/v1/messages', {
          number: `1${number}`,
          message: msg
        })
        .then(() => {
            resolve(true);
        })
        .catch((err) => {
            reject({ok: false, error: err});
        })
    })
}

module.exports = sendWhatsAppMessage;