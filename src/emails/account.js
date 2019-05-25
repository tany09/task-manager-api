const sgm = require('@sendgrid/mail');

const sgApiKey = process.env.SENDGRID_API_KEY;

sgm.setApiKey(sgApiKey);

const sendWelcomeEmail = (email, name) => {
    sgm.send({
        to: email,
        from: 'tanysingh09@gmail.com',
        subject: 'Welcome to the app!',
        text: `Hey ${name}. We are happy to see you onboard`
    });
}

const sendGoodbyeEmail = (email, name) => {
    sgm.send({
        to: email,
        from: 'tanysingh09@gmail.com',
        subject: 'Goodbye user',
        text: `Goodbye ${name}. We were sad to see you leave. We would be happy to know why you decided to leave our app and would work to improve our services.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}