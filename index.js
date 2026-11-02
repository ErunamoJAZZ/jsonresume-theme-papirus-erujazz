const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const moment = require('moment');
const pluralize = require('pluralize');

function render(resume) {
  const css = fs.readFileSync(path.join(__dirname, '/style.css'), 'utf-8');
  const tpl = fs.readFileSync(path.join(__dirname, '/resume.hbs'), 'utf-8');
  const partialsDir = path.join(__dirname, 'partials');
  const filenames = fs.readdirSync(partialsDir);

  Handlebars.registerHelper({
    formatDate: function (date) {
      if (typeof date === 'undefined') {
        return 'now';
      }
      return moment(date).format('MMM YYYY');
    },
    formatDateYear: function (date) {
      if (typeof date === 'undefined') {
        return 'now';
      }
      return moment(date).format('YYYY');
    },
    networkIcon: function (network) {
      if (network === 'StackOverflow') {
        return 'stack-overflow';
      } else {
        return network.toLowerCase();
      }
    },
    wordWrap: function (str) {
      str = str.replace(/\//g, '/ ');
      return str.replace('/ / ', '//');
    },
    // Prefer a break after "/", never at "-". Chrome otherwise wraps
    // the LinkedIn URL at the hyphen and drops it below the icon.
    breakUrl: function (str) {
      if (typeof str !== 'string') {
        return '';
      }
      const html = Handlebars.escapeExpression(str)
        .replace(/\//g, '/\u200B')
        .replace(/-/g, '\u2011');
      return new Handlebars.SafeString(html);
    },
    dateDiff: function (startDate, endDate) {
      let text = '';
      startDate = moment(startDate);
      if (endDate === null || endDate === '' || endDate === undefined) {
        endDate = moment();
      } else {
        endDate = moment(endDate);
      }
      let years = endDate.diff(startDate, 'years');
      startDate.add(years, 'years');
      let months = endDate.diff(startDate, 'months');

      if (years > 0) {
        text += `${years} ${pluralize('years', years)}`;
      }
      if (months > 0) {
        if (years > 0) {
          text += ' ';
        }
        text += `${months} ${pluralize('months', months)}`;
      }

      return text;
    },
  });

  filenames.forEach(function (filename) {
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
      return;
    }
    const name = matches[1];
    const filepath = path.join(partialsDir, filename);
    const template = fs.readFileSync(filepath, 'utf8');

    Handlebars.registerPartial(name, template);
  });
  return Handlebars.compile(tpl)({
    css: css,
    resume: resume,
  });
}

exports.render = render;
exports.pdfRenderOptions = {
  format: 'Legal',
  printBackground: false,
  preferCSSPageSize: true,
  displayHeaderFooter: false,
};
