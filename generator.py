# func that returns a generator object
def countdown(start):
  val = start
  while val >= 0:
    yield val
    val -= 1

generator_object = countdown(4)
print("generator_object:", generator_object)

# iterate over the generator_object
while True:
  try:
    generated_value = next(generator_object)
    print("generated_object.__next__() returned:", generated_value)
  except StopIteration:
    print("generated_object.__next__() raised StopIteration")
    break # EOS

# more convenient iteration via for/in:
for x in countdown(4):
  print("for/in loop value=", x);

# or here using the generator/iterator in a more compact list comprehension
print("iterated values:", [x for x in countdown(4)])

# or here using the generator/iterator in a more compact generator expression
print("generator expression result:", list(x*10 for x in countdown(4)))