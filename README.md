# Bomberman game project
![last-commit](https://img.shields.io/github/last-commit/wzarek/bomberman)
![made-with-react](https://img.shields.io/badge/made%20with-React-61dafb.svg)
![made-with-nodejs](https://img.shields.io/badge/made%20with-Node.js-339933.svg)
![made-with-socketio](https://img.shields.io/badge/made%20with-Socket.io-000000.svg)
![made-with-typescript](https://img.shields.io/badge/made%20with-Typescript-3178C6.svg)


## How to run this project

In the `client` and also `server` directory install all required packages:

```
$ cd client
$ npm install
$ cd ../server
$ npm install
```

Run the server in the `server` directory:
```
$ cd server
$ npm start
```

Next, run the client in the `client` directory:
```
$ cd client
$ npm start
```
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

All server-sided logs will appear in your server terminal.

## How to play

### Connecting to the lobby / finding game
Firstly, you need to set up your **nickname**.  
Then, **choose** a lobby from room list or **create** your own room.

### In game
You can move by using `arrow keys` and plant a bomb by using `spacebar`.

#### Player

<div align="center">
  <img src='https://github.com/wzarek/bomberman/blob/master/client/src/static/img/player.png?raw=true' alt='player'/>
 </div>
 
 As a player, you initially have only 3 lives. You need to be careful with them. Any contact with an explosion will remove one life from you. On right panel (_playerlist_) you can check how many lives do you - or other players - have.

#### Bomb

<div align="center">
  <img src='https://github.com/wzarek/bomberman/blob/master/client/src/static/img/bomb.png?raw=true' alt='bomb'/>
 </div>
 
 Soo, this is a bomb. You know what it does, right? After planting you have 3 seconds to run away from it. Otherwise one of your remaining lives will be taken.
 
#### Blocks
There are two types of blocks:

<div align="center">
  <img src='https://github.com/wzarek/bomberman/blob/master/client/src/static/img/wall.png?raw=true' alt='wall'/>
  <p>
    <b>Wall block</b> - <i>non-breakable</i> - It's just to make game harder and more interesting. You <i>can't break</i> it but you can easily hide behind.
  </p>
</div>

<div align="center">
  <img src='https://github.com/wzarek/bomberman/blob/master/client/src/static/img/bonus.png?raw=true' alt='bonus'/>
  <p>
    <b>Bonus block</b> - <i>breakable</i> - After you break it there is a 40% chance that it's <i>empty</i>, 30% chance for <i>speed boost</i> and also 30% chance for <i>cooldown reduction</i>.
  </p>
</div>

#### Bonuses

We can't tell you much about bonuses yet. For now all you need to know that one of them is increasing your speed by 0.5 and the other one decreasing your bomb cooldown by 0.5s.
