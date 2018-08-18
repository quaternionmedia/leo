FROM crossbario/crossbar

USER root

COPY ./web /leo


COPY ./.crossbar /leo/.crossbar
RUN chown -R crossbar:crossbar /leo

ENTRYPOINT ["crossbar", "start", "--cbdir", "/leo/.crossbar"]
