function* countdown(start) {
  var val = start;
  while (val >= 0) {
    var delta = (yield val) || 1;
    val -= delta
  }
}

generator_object = countdown(10);
print = console.log;
print(generator_object.next());
print(generator_object.next());
print(generator_object.next(5)); // instead of send(5)
print(generator_object.next());
try {
  generator_object.throw(new Error('foo')) // has no thrilling effect on our generator since it doesnt try-catch it
}
catch (ex) {
  print("generator re-threw exception: ", ex.message);
}