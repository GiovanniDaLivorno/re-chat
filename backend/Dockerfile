FROM python:3.11-slim

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Ensure logs appear immediately
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Install dependencies globally, accessible to all users
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Create non-root user
RUN adduser --disabled-password gio
USER gio

# Copy app code
COPY . .

EXPOSE 1000

# Use multiple workers in production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "1000", "--workers", "4"]
