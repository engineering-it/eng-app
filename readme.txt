==============================
engApp

- Framework per applicazioni client -

===============================

-installare node e npm

poi lanciare nella dir del progetto "npm install"

per creare la libreria distribuibile:

lanciare "grunt" nella root dir /engApp del progetto.


build: contiene le versioni finali compilate della libreria
demo: contiene i file di demo per testare la libreria
src: contiene il sorgente della libreria
libs: contiene librerie usate da engApp

proxy:

per vedere i proxy impostati su npm
npm config get proxy
npm config get https-proxy

per impostare i proxy impostati su npm
npm config set proxy http://<nome>:<psw>@proxy.eng.it:3128
npm config set https-proxy http://<nome>:<psw>@proxy.eng.it:3128

per cancellare i proxy
npm config delete proxy
npm config delete https-proxy

vanno impostati anche su git e bower