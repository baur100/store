import app from './src/app.js';

const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log('App runs on port: ', port);
});