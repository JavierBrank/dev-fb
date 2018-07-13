/home/riki/gitlab/testriki

#Proyect FACEBOOK (Javi)
git clone https://gitlab.com/JavierBrank1/dev-fb.git

cd dev-fb/
npm start
npm i -S 
vim index.js => (Modificar linea 38 el puerto, poner 5050)
//app.set('port', (process.env.PORT || 8080));
app.set('port', (process.env.PORT || 5050));

#Restart node
killall node;npm start


