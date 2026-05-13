# Use the official Microsoft Playwright image to get all browser dependencies
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY main.py .

# Command to run the application
# Use the PORT environment variable injected by Cloud Run (default 8080)
CMD ["python", "main.py"]
