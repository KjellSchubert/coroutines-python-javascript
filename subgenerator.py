def subgenerator(start):
  val = start
  while val >= 0:
    yield val
    val -= 1
  
def countdown(start):
  if start >= 0:
    yield start
  yield subgenerator(start - 1)

print(list(countdown(4)))

def countdown_fixed(start):
  if start >= 0:
    yield start
  yield from subgenerator(start - 1) # note the 'yield from' here

print(list(countdown_fixed(4)))
