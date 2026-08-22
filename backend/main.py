from fastapi import FastAPI

app = FastAPI(
    title="FinPlan API",
    description="Personal financial planning API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "FinPlan API is running 🚀"
    }