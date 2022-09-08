# Leo

Named after the conductor Leonard Bernstein, Leo is a group sheet music app, designed by musicians, and used by musicians.

## Setup

1. Clone this repo:

```
git clone https://github.com/quaternionmedia/leo.git
```

1. `cd` into directory

```
cd leo
```

1. Initialize the requirements

```
./leo init
```

## dev

With docker-compose up and running, add pdf files to the folder named `pdf/`, then:

`./leo dev`

If the docker images have changed, run `./leo dev --build`

Site will be available at: http://localhost:8000

## production

With a [traefik](https://traefik.io) instance running:

`./leo prod`

## Come Join!

Join the fun and conversation @ our Discord: https://discord.gg/FycdT36
