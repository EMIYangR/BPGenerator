# Low-Code Editor

This Project implements [***Liquipedia***](https://liquipedia.net/honorofkings/)'s *Ban&Picks* formatting output, which reduces the increased inspection cost caused by output errors and improves certain writing efficiency.

#### Page Effect

![Main](images/01.png)

#### Output effect

##### Standard Output

``` javascript
        |team1side=blue|team2side=red|length=99:59|winner=1
        <!-- Hero picks -->
        |t1h1=agudo|t1h2=agudo|t1h3=agudo|t1h4=agudo|t1h5=agudo
        |t2h1=agudo|t2h2=agudo|t2h3=agudo|t2h4=agudo|t2h5=agudo
        <!-- Hero bans -->
        |t1b1=agudo|t1b2=agudo|t1b3=agudo|t1b4=agudo|t1b5=agudo
        |t2b1=agudo|t2b2=agudo|t2b3=agudo|t2b4=agudo|t2b5=agudo
```
##### Standard Output (New Format)

``` javascript
        |team1side=blue |team2side=red |length=99:59 |winner=1
        <!-- Hero picks -->
        |t1h1=agudo |t1h2=agudo |t1h3=agudo |t1h4=agudo |t1h5=agudo
        |t2h1=agudo |t2h2=agudo |t2h3=agudo |t2h4=agudo |t2h5=agudo
        <!-- Hero bans -->
        |t1b1=agudo |t1b2=agudo |t1b3=agudo |t1b4=agudo |t1b5=agudo
        |t2b1=agudo |t2b2=agudo |t2b3=agudo |t2b4=agudo |t2b5=agudo
```

##### 5Ban & 5Pick

``` javascript
        |team1side=blue|team2side=red|length=00:00|winner=1
        <!-- Hero picks -->
        |t1h1=|t1h2=|t1h3=|t1h4=|t1h5=
        |t2h1=|t2h2=|t2h3=|t2h4=|t2h5=
        <!-- Hero bans -->
        |t1b1=|t1b2=|t1b3=|t1b4=|t1b5=
        |t2b1=|t2b2=|t2b3=|t2b4=|t2b5=
```

##### 4Ban & 5Pick

``` javascript
        |team1side=blue|team2side=red|length=00:00|winner=1
        <!-- Hero picks -->
        |t1h1=|t1h2=|t1h3=|t1h4=|t1h5=
        |t2h1=|t2h2=|t2h3=|t2h4=|t2h5=
        <!-- Hero bans -->
        |t1b1=|t1b2=|t1b3=|t1b4=
        |t2b1=|t2b2=|t2b3=|t2b4=
```

##### Ultimate Battle

``` javascript
        |team1side=blue|team2side=red|length=00:00|winner=1
        <!-- Hero picks -->
        |t1h1=|t1h2=|t1h3=|t1h4=|t1h5=
        |t2h1=|t2h2=|t2h3=|t2h4=|t2h5=
```

##### Only Need Picks

```javascript
        <!-- Hero picks -->
        |t1h1=|t1h2=|t1h3=|t1h4=|t1h5=
        |t2h1=|t2h2=|t2h3=|t2h4=|t2h5=
```

##### Only Need 4Bans

```javascript
        <!-- Hero bans -->
        |t1b1=|t1b2=|t1b3=|t1b4=
        |t2b1=|t2b2=|t2b3=|t2b4=
```

##### Only Need 5Bans

```javascript
        <!-- Hero bans -->
        |t1b1=|t1b2=|t1b3=|t1b4=|t1b5=
        |t2b1=|t2b2=|t2b3=|t2b4=|t2b5=
```

##### Only Need Ban & Picks

```javascript
        <!-- Hero picks -->
        |t1h1=|t1h2=|t1h3=|t1h4=|t1h5=
        |t2h1=|t2h2=|t2h3=|t2h4=|t2h5=
        <!-- Hero bans -->
        |t1b1=|t1b2=|t1b3=|t1b4=|t1b5=
        |t2b1=|t2b2=|t2b3=|t2b4=|t2b5=
```

##### Game in Progress

```javascript
        |team1side=blue|team2side=red|length=|winner=
        <!-- Hero picks -->
        |t1h1=|t1h2=|t1h3=|t1h4=|t1h5=
        |t2h1=|t2h2=|t2h3=|t2h4=|t2h5=
        <!-- Hero bans -->
        |t1b1=|t1b2=|t1b3=|t1b4=|t1b5=
        |t2b1=|t2b2=|t2b3=|t2b4=|t2b5=
```

#### Using Help

The BP input box supports prompt words. This Demo supports most alias prompts for ***Honor of Kings (including Global services)***. You can also modify them by modifying the ***dataArray*** array of  ***data.js*** . Support setting multiple  ***aliases*** for a hero, and the corresponding values are as follows:

| name  | value              |
| ----- | ------------------ |
| vulue | Final output value |
| text  | prompt words       |
| alias | alias (DIY)        |

Currently, this project supports localized custom hero aliases and the addition of new heroes.

If you plan to run it locally, it is recommended to use [Visual Studio Code](https://code.visualstudio.com/)'s **Live Server** plug-in to deploy this Demo. Please understand the inconvenience caused.

#### Finally

Due to the rush of time, this Project has many shortcomings. Welcome to raise them to me through Issue!
