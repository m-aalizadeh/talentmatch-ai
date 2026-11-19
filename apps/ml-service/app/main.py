
from fastapi import FastAPI

app = FastAPI(
    title="TalentMatch AI",
    description="Machine Learning Service",
    version="0.1.0"
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ml-service"
    }


@app.get("/")
def root():
    return {
        "message": "Welcome to TalentMatch AI ML Service"
    }
