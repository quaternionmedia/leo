# Leo
Named after the conductor Leonard Bernstein, Leo is a group sheet music app, designed by musicians, and used by musicians.

### dev
Add pdf files to the folder named `pdf/`, then:

`./leo dev`

If the docker images have changed, run `./leo dev --build`

Site will be available at: http://localhost:8000

### production
With a [traefik](https://traefik.io) instance running:

`./leo prod`
