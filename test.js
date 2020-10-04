/* eslint-disable */
connect = (name) => {
  App.$children[0].$children[0].$socket.client.io.opts.query = {
    roomName: name
  }

  App.$children[0].$children[0].$socket.client.open();
}

create = (name, owner) => {
  App.$children[0].$children[0].$socket.client.emit('createRoom', {
    ownerName: owner,
    roomName: name,
    options: {
      codeLength: false,
      autoIndent: true,
    },
    languageIndex: 0,
  });
}

checkName = (name) => {
  App.$children[0].$children[0].$socket.client.emit('checkPlayerName', name);
}

join = () => {
  App.$children[0].$children[0].$socket.client.emit('joinRoom');
}

useCustomCode = (action) => {
  App.$children[0].$children[0].$socket.client.emit('useCustomCode', action);
}

test = (name) => {
  connect(name);
  player = 'p' + name;
  create(name, player);
  checkName(player);
  join();
  useCustomCode(true)
}

count = 0

spam = async () => {
  test('r' + count)
  count += 1;
  setTimeout(async () => spam(), 100);
}