FROM crossbario/crossbar

USER root

COPY .crossbar /.crossbar
RUN chown -R crossbar:crossbar /.crossbar

#COPY ./web /leo

ENTRYPOINT ["crossbar", "start", "--cbdir", "/.crossbar"]
