const EventStream = require('./');

EventStream()
  .apiSecret('api secret')
  .fromDate('2017-01-01 12:00')
  .toDate('2017-01-01 18:00')
  .event(['event name'])
  .createStream()
  .on('data', data => console.log(data));
