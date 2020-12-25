    } catch (e) {
      console.log('Stats update failed');
      console.error(e);
      res.sendStatus(500);
    }
  });


  app.use(express.static(path.join(__dirname, '../dist')));
}

const PORT = process.env.PORT || 3000;

const server = http.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0    } catch (e) {
      console.log('Stats update failed');
      console.error(e);
      res.sendStatus(500);
    }
  });


  app.use(express.static(path.join(__dirname, '../dist')));
}

const PORT = process.env.PORT || 3000;

const server = http.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0