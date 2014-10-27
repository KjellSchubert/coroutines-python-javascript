import asyncio
import os
import os.path

# for running sync I/O in a threadpool
def run_async(func):
  # this first approach here doesn't work:
  #   return asyncio.async(asyncio.coroutine(func)())
  # since it blocks the loop while executing the func.
  # This here does work, but WARNING: if you have a lot of parallel slow I/O
  # tasks then the threadpool will still become a bottle neck!
  # Someone please impl true (nodejs-style) async file io for Python :)
  return asyncio.get_event_loop().run_in_executor(None, func)

@asyncio.coroutine
def subgenerator_readFilePrefixAsUtf8(fd):
  print("reading (prefix of) file content");
  read_chunk_size_in_bytes = 10
  bytes_read = yield from run_async(lambda: os.read(fd, read_chunk_size_in_bytes))
  return bytes_read.decode('utf8');

def openAndReadFilePrefix(file_name):
  print("opening file");
  fd = yield from run_async(lambda: os.open(file_name, os.O_RDONLY))
  try: # TODO: use 'with' statement? Not doing this atm to have the code look more comparable to the JS impl
    fileContentPrefix = yield from subgenerator_readFilePrefixAsUtf8(fd); # 'yield' won't work btw
    print('file content: ' + fileContentPrefix);
    return fileContentPrefix;
  finally:
    print("closing file");
    yield from run_async(lambda: os.close(fd))

loop = asyncio.get_event_loop()
loop.run_until_complete(openAndReadFilePrefix('data.txt'));
loop.close()
print("done (including event loop)");
