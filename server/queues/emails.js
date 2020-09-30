/**
 * Manage event of emails
 */
import { Mailer } from '../components';
import keys from '../config/keys';

module.exports = (queue) => {
  queue.process(keys.SEND_MAIL, (job, done) => {
    Mailer.sendMail(job.data.template, job.data.to, Object.assign({subject: job.data.subject}, job.data.data), (err) => {
      done(err);
    });
  });
};