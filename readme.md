Coroutines in Python & Javascript/nodejs: 'yield' vs 'yield from' vs 'yield*'
---

What had puzzled me for many months is that the Python designers saw a need for enforcing the use of 'yield from' in
[asyncio](http://legacy.python.org/dev/peps/pep-3156/), whereas nodejs + [co](https://www.npmjs.org/package/co) works 
fine with a plain 'yield' (instead of 'yield*'). Both languages support .NET-style 
[async/await](http://msdn.microsoft.com/en-us/library/hh191443.aspx) in a very similar fashion via coroutines that
yield Promises aka Futures. This here is a comparison of the use of generators & coroutines in both languages.
I plan to mostly keep this around as a coroutine cheatsheet for myself.

History
---

Here a brief history of coroutines in Python & asyncio:

* in 2001 [PEP 255](http://legacy.python.org/dev/peps/pep-0255/) adds generators and the 'yield' statement to Python, motivated by the desire to implement iterators in a more compact fashion
* in 2003 [PEP 289](http://legacy.python.org/dev/peps/pep-0289/) adds generator expressions, a variant of list comprehensions tailed to generator objects
* in 2005 [PEP 342](http://legacy.python.org/dev/peps/pep-0342/) adds a send() method to generator objects, which allows sending values to generators, turning a generator into a coroutine
* in 2009 'yield from' was added in [PEP 380](http://legacy.python.org/dev/peps/pep-0380/), with the main goal of simplifying the refactoring of generators via 'yield from' a subgenerator
* in 2012 [PEP 3156](http://legacy.python.org/dev/peps/pep-3156/) adds .NET-style async/await via coroutines that yield [asyncio.Futures](https://docs.python.org/3/library/asyncio-task.html#future)

Here's a brief history of coroutines in Javascript/nodejs:

* 2009 nodejs supports async IO via a purely callback-based API, there's no direct support for promises or generators
* 2011ish [Promises/A+](https://promisesaplus.com/) remedies '[callback hell](http://callbackhell.com/)' and the '[pyramid of doom](http://tritarget.org/blog/2012/11/28/the-pyramid-of-doom-a-javascript-style-trap/)' that callback-based implementations tend to suffer from, but there's no support for generators/coroutines yet
* 2014 nodejs 0.11 adds support for [ES6 generators](http://wiki.ecmascript.org/doku.php?id=harmony:generators), used by control flow packages like [co](https://www.npmjs.org/package/co) to implement .NET-style async/await based on coroutines that yield promises. 
* there are preliminary plans for generator expression in Javascript, as well as unifying these with iterators, see [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)

Generator functions
---

Let's start with plain generators (generator.py & generator.js):



    # Python:
    def countdown(start):
      val = start
      while val >= 0:
        yield val
        val -= 1
      
    // Javascript:
    function* countdown(start) {
      var val = start;
      while (val >= 0) {
        yield val;
        val -= 1;
      }
    }

Python actually strays from its goal of being explicit: adding a yield somewhere in a regular 
function will turn this function silently into a generator, with very different execution behavior.
Javascript is more explicit here by requiring generator functions to be declared with function*() 
instead of function().

For both Python & JS calling a generator function will return a generator object. Explicitly iterating over the generator object's values:

    # Python
    generator_object = countdown(4)
    while True:
      try:
        generated_value = next(generator_object)
        print("generated_object.__next__() returned:", generated_value)
      except StopIteration:
        print("generated_object.__next__() raised StopIteration")
        break # EOS

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

The Python & Javascript generator variants behave very similar with respect to iterating via next(). As of node 0.11.12 there are
some  differences with respect to how values are communicated back to the caller of next(): JS will return { value: 3, done: false } 
object, whereas Python returns the value directly & communicates EOS via StopIteration exception. Practically you'll hardle ever
iterate over the generator object's values via next() in either language, so this difference is not especially important. 
Instead you'll iterate generated values more conveniently via JS for/of (or for/in?) statement and Python's for/in statement:

    # Python
    for x in countdown(4):
      print("for/in loop value=", x);

    // JS
    for (x of countdown(4)) {
      console.log("for/of loop value=", x);
    }

Which is identical syntax & semantics (e.g. with respect to exception handling). In Python you can consume generated values 
even more conveniently via list comprehensions and generator expressions, which are still in its infancy in JS (e.g. see 
[here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators), this doesn't work in node
0.11.12 yet afaik, and don't know if it ever will). So here only the Python code for generator expressions:

    # Python
    print("iterated values:", [x for x in countdown(4)])
    print("generator expression result:", list(x*10 for x in countdown(4)))

subgenerators: 'yield from' aka 'yield*'
---

Now let's compare subgenerators in both languages: let's imagine someone wants to refactor the countdown() generator function 
ingeniously by delagating some of the work to a subgenerator. See code in subgenerator.js and subgenerator.py:

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

Forget for a moment that this example is contrived & actually bloats the code for the countdown() implementation, let's
assume there are examples where delating to a subgenerator is desirable. In any case the output of this program is not
the naively expected [4, 3, 2, 1, 0] but [4, &lt;generator object subgenerator at 0x00527A08&gt;]. This is where 'yield from'
comes into play:

    def countdown_fixed(start):
      if start >= 0:
        yield start
      yield from subgenerator(start - 1) # note the 'yield from' here

    print(list(countdown_fixed(4)))

This now prints [4, 3, 2, 1, 0], in other words 'yield from' allowed us to easily refactor our generator function's
implementation without client code even noticing that the output from several internal generators had been concatenated. So
'yield from' flattened the chain or tree of generators into a single flat generator. Javascript supports the same
feature but calls this operator 'yield*' instead of 'yield from':

    function* countdown_fixed(start) {
      if (start >= 0) {
        yield start;
      }
      yield* subgenerator(start - 1); // notice the yield*
    }

coroutines
---

Generators are turned into coroutines by having the generator's consumer call generator_object.send(value) instead of 
generator_object.next(). In both languages a next() is 100% equivalent to a send(None). Example code is in coroutine.py
and coroutine.js:

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

This prints the sequence [10, 9, 4, 3]. The JS code looks exactly the same, except instead of generator_object.send(value)
you call generator_object.next(value):

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

Once you're allowing the passing of values back into the coroutine it's only natural to also allow passing
exceptions in, which both languages do via generator_object.throw():

    # Python
    try:
      generator_object.throw(Exception('foo'))
    except:
      print("generator re-threw exception")    
      
    // JS
    try {
      generator_object.throw(new Error('foo'))
    }
    catch (ex) {
      print("generator re-threw exception: ", ex.message);
    }

Just in case you were wondering what these funky coroutines could possibly be used for: some genius had the idea of
having a coroutine return Futures (aka JS promises or .NET Tasks - they are all the same thing) to the caller. The
caller then will wait for the Future to get resolved or rejected and pass the resulting value (or exception) back
into the coroutine. This results in async code that looks exactly like it's blocking equivalent, code
that's more easily readable than callback- or promise-then-based code (e.g. see 
[here](https://github.com/KjellSchubert/promise-future-task) for more details):

async/await
---

Now let's compare .NET-style async/await in Python & Javascript, using async file I/O as an example (some HTTP
I/O would probably be more practically relevant, but whatever). The application should use non-blocking async
I/O to open & read a single file, solving the problem with async/await-style coroutines. To pull dependencies
and execute the JS sample run:

    >npm install    # reads package.json
    >node --harmony async_await.js

The coroutine looks like this for JS (see async_await.js):

    function* subgenerator_readFilePrefixAsUtf8(fd) {
      var buffer = new Buffer(10);
      yield fs.readAsync(fd, buffer, 0, buffer.length, 0);
      return buffer.toString('utf8');
    }

    function* openAndReadFilePrefix(fileName) {
      var fd = yield fs.openAsync(fileName, 'r');
      try {
        fileContentPrefix = yield subgenerator_readFilePrefixAsUtf8(fd);
        return fileContentPrefix;
      }
      finally {
        yield fs.closeAsync(fd);
      }
    }
    
So this code yields [Bluebird.js](https://www.npmjs.org/package/bluebird) promises, with co feeding the values
these promises resolved to back into the coroutine. This code looks exactly like the equivalent sync/blocking code
would look like, except for having been peppered with a few 'yield' expressions. Note that both 'yield' and 
'yield*' work fine here, whereas Python's asyncio enforces the usage of 'yield from'. I'm still not sure why exactly btw.

The only reason I used Bluebird.js 
promises instead of [Q](https://www.npmjs.org/package/q) was because of the convenient promisifyAll(), though this 
kinda backfired since fs.readAsync() didn't work correctly until I added the final 0 param (but why didn't I have to
add the last param for fd.openAsync?). So promisifyAll() is not working as seamlessly I had hoped with respect to
trailing default method params.

Now looking at the equivalent Python asyncio code (see async_await.py):

    @asyncio.coroutine
    def subgenerator_readFilePrefixAsUtf8(fd):
      read_chunk_size_in_bytes = 10
      bytes_read = yield from run_async(lambda: os.read(fd, read_chunk_size_in_bytes))
      return bytes_read.decode('utf8');

    @asyncio.coroutine
    def openAndReadFilePrefix(file_name):
      fd = yield from run_async(lambda: os.open(file_name, os.O_RDONLY))
      try:
        fileContentPrefix = yield from subgenerator_readFilePrefixAsUtf8(fd);
        return fileContentPrefix;
      finally:
        yield from run_async(lambda: os.close(fd))

This code looks very much like its nodejs coroutine counterpart, despite nodejs having an underlying callback
based filesystem API, and Python having a blocking one. Where nodejs coroutines yielded Promises Python yielded
Futures. I still am not sure why Python insists on using 'yield from' instead of 'yield', I'm guessing a variant
using 'yield' would have worked just as well. The nodejs variant seems a bit simpler because it only will ever 
allow a single event loop per process, whereas in Python you theoretically could run multiple event loops, which
I imagine could cause some headaches with control flow transitions between event loops. Practically this won't
make a difference for Python apps sticking to a single event loop. What would be nice to have is a promisifyAll()
equivalent for Python that turns Python's blocking os package API into a Future-based API, not that the boilerplate
code with 

    yield from run_async(lamda: ...)
   
seems excessive. What would be even nicer to have is some confidence that the Python application is not 
accidentally calling a blocking API in its @asyncio.coroutine functions, since this could severely cripple
the throughput of an HTTP server running these accidentally-blocking coroutines. Anyway: writing coroutine-based
async I/O code is very convenient in both languanges.