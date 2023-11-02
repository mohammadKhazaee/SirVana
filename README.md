<div align="center">
    <h1><b>SirVana</b></h1>
</div>

![index view](./readme/index-view.jpg)

_A website for dota2 players to create create and find teams, communicate with eachother, create and join tournaments with their team._

### Link to Website: [Live Page](https://sirvana.iran.liara.run/)

### Installation

#### `Step 1` - clone the repo

```bash
$ git clone https://github.com/mohammadKhazaee/SirVana.git
```

#### `Step 2` - cd in the repo

```bash
$ cd SirVana
```

#### `Step 3` - install dependencies

```bash
$ npm install
```

#### `Step 4 (Optional)` - set environment variables (if you wanna test email features)

- EMAIL (email which app will emails with)
- OAUTH_CLIENT_ID
- OAUTH_CLIENT_SECRET
- OAUTH_REFRESH_TOKEN

> _For more info about accessing to OAuth credentials go [here](https://masashi-k.blogspot.com/2013/06/sending-mail-with-gmail-using-xoauth2.html)_

#### `Step 5` - run application

```bash
$ npm start
```

In browser, open [http://localhost:3000](http://localhost:3000)

## Main Features

- Looking For Team or Player Message Box (using socket.io)
  ![Sample App Image](./readme/lf-message-view.jpg)
- Live AJAX Search for teams, players & tournament

- Managing Incomming Requests, Keep Track of Sent Requests & Real Time Private Chat
  ![Sample App Image](./readme/notif-view.jpg)

- Tournament Organizers Can Schedule Games
  ![Sample App Image](./readme/tour-info-page.jpg)

- Share Feeds With Other Users In Profile
  ![Sample App Image](./readme/profile-feed.jpg)

#### License

MIT © [mohammadKhazaee](https://github.com/mohammadKhazaee)

## Contributors

- Back-End Developer [@mohammadKhazaee](https://github.com/mohammadKhazaee)
- Front-End Developer [@fshd1-front](https://github.com/fshd1-front)

<div align="center">
  <sub>If you found a bug or some improvments, feel free to raise an issue and send a PR!</sub>
</div>
