# Use the official Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Expose port 8000
EXPOSE 8000

# Use entrypoint script to run migrations and collectstatic, then start gunicorn
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "cineverse_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
