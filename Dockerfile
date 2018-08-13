FROM crossbario/crossbar

USER root
COPY . /leo
RUN chown -R crossbar:crossbar /leo

ENTRYPOINT ["crossbar", "start", "--cbdir", "/leo/.crossbar"]
