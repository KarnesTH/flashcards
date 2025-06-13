FROM python:3.13-alpine

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "backend.wsgi:application"]