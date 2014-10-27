def countdown(start):
  val = start
  while val >= 0:
    delta = (yield val) or 1
    val -= delta

generator_object = countdown(10)
print(generator_object.__next__()) # aka next(generator_object)
print(generator_object.__next__())
print(generator_object.send(5))
print(generator_object.__next__())
try:
  generator_object.throw(Exception('foo')) # has no thrilling effect on our generator since it doesnt try-catch it
except:
  print("generator re-threw exception")