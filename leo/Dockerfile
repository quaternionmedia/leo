FROM python
RUN pip install uvicorn

WORKDIR /app
COPY ./leo leo/
COPY pyproject.toml README.md .

RUN pip install .

CMD ["uvicorn", "leo.main:app", "--host", "0.0.0.0", "--reload"]
