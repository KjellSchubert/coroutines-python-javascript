function* subgenerator(start) {
  var val = start;
  while (val >= 0) {
    yield val;
    val -= 1;
  }
}

function* countdown(start) {
  if (start >= 0) {
    yield start;
  }
  yield subgenerator(start - 1);
}

for (x of countdown(4)) {
  console.log("countdown for/of loop value=", x);
}

// now the same with 'yield from' aka 'yield*'
function* countdown_fixed(start) {
  if (start >= 0) {
    yield start;
  }
  yield* subgenerator(start - 1); // notice the yield*
}

for (x of countdown_fixed(4)) {
  console.log("countdown_fixed for/of loop value=", x);
}

