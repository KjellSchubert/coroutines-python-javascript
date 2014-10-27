Promise = require('bluebird'); // promises (Q.js, bluebird.js all work fine, I chose bluebird.js because of promisifyAll)
co = require('co'); // coroutine execution
fs_callback = require('fs');

// For nodejs we need to turn the callback-based fs API into a promise-based one,
// this here uses Bluebird's promisifyAll which turns function xyz taking a 
// callback into function xyzAsync returning a promise.
fs = Promise.promisifyAll(fs_callback);

function* subgenerator_readFilePrefixAsUtf8(fd) {
  var buffer = new Buffer(10);
  console.log("reading (prefix of) file content");
  yield fs.readAsync(fd, buffer, 0, buffer.length, 0); // if you don't add the 0 then promisifyAll() will fail ungracefully :(
  return buffer.toString('utf8');
}

function* openAndReadFilePrefix(fileName) {
  console.log("opening file");
  var fd = yield fs.openAsync(fileName, 'r');
  try {
    fileContentPrefix = yield subgenerator_readFilePrefixAsUtf8(fd); // yield* works the same btw
    console.log('file content: ' + fileContentPrefix);
    return fileContentPrefix;
  }
  finally {
    console.log("closing file");
    yield fs.closeAsync(fd);
  }
}

co(openAndReadFilePrefix)('data.txt'); // co() is like Python's loop.run_until_complete()
console.log("done (generator will keep executing until it's done)");
