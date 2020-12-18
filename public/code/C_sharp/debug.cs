'\x1b[36m%s\x1b[0m', `Server listening on port ${PORT}!`);
});

const shutdown = () => {
  console.warn('Server is pending shutdown');
  server.close();
  if (PROD) {
    toggleMaintanceMode(true);
    setTimeout(() => {
      console.warn('Ready for shutdown');
      process.exit(0);
    }, 2000);
  } else {'\x1b[36m%s\x1b[0m', `Server listening on port ${PORT}!`);
});

const shutdown = () => {
  console.warn('Server is pending shutdown');
  server.close();
  if (PROD) {
    toggleMaintanceMode(true);
    setTimeout(() => {
      console.warn('Ready for shutdown');
      process.exit(0);
    }, 2000);
  } else {