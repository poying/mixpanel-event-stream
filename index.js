const split = require('split');
const moment = require('moment');
const assert = require('assert');
const request = require('superagent');
const JSONStream = require('JSONStream');
const filter = require('./filter');

function EventStream() {
  if (!(this instanceof EventStream)) {
    return new EventStream();
  }
  this._apiSecret = null;
  this._fromDate = null;
  this._toDate = null;
  this._event = [];
  this._where = [];
  this._filter = [];
}

EventStream.prototype = {
  apiSecret(apiSecret) {
    this._apiSecret = apiSecret;
    return this;
  },

  fromDate(date) {
    this._fromDate = new Date(date);
    const time =  Math.floor(this._fromDate.getTime() / 1000);
    this.filter(data => data.properties.time >= time);
    return this;
  },

  toDate(date) {
    this._toDate = new Date(date);
    const time = Math.ceil(this._toDate.getTime() / 1000);
    this.filter(data => data.properties.time <= time);
    return this;
  },

  event(eventNames) {
    this._event = eventNames;
    return this;
  },

  // https://mixpanel.com/help/reference/data-export-api#segmentation-expressions
  where(expression) {
    this._where.push(expression);
    return this;
  },

  filter(fn) {
    this._filter.push(fn);
  },

  createStream() {
    assert(this._apiSecret, 'apiSecret is requred');
    assert(this._fromDate, 'fromDate is required');
    assert(this._toDate, 'toDate is required');
    return request
      .get(`https://${this._apiSecret}@data.mixpanel.com/api/2.0/export`)
      .query({
        from_date: moment(this._fromDate).format('YYYY-MM-DD'),
        to_date: moment(this._toDate).format('YYYY-MM-DD'),
        event: JSON.stringify(this._event),
        where: this._where.join(' and ')
      })
      .pipe(split())
      .pipe(JSONStream.parse())
      .pipe(filter(data => this._filter.reduce((res, fn) => res && fn(data), true)));
  }
};

module.exports = EventStream;
