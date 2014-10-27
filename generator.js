// run with nodejs >= 0.11 using --harmony:
// >node --harmony generator.js
function* countdown(start) {
  var val = start;
  while (val >= 0) {
    yield val;
    val -= 1;
  }
}

generator_object = countdown(4);
console.log("generator_object:", generator_object)

// iterate over the generator_object
while (true) {
  try {
    var generated_value = generator_object.next();
    console.log("generated_object.next() returned:", generated_value)
  }
  catch (ex) {
    console.log("generated_object.next() threw exception:", ex.message)
    break;
  }
}

// more convenient iteration over the generator_object via for/of statement
// (from http://wiki.ecmascript.org/doku.php?id=harmony:generators)
for (x of countdown(4)) {
  console.log("for/of loop value=", x);
}

// another variant using generator expressions (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
// but this doesn't work in node 0.11.12 yet afaik, and not sure if it ever will:
//let it = (i * 10 for (i in countdown(4)));
