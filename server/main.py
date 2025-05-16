# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

FILE = "tasks.json"

def load_tasks():
    if not os.path.exists(FILE):
        return {"tasks": []}
    with open(FILE, "r") as f:
        return json.load(f)

def save_tasks(data):
    with open(FILE, "w") as f:
        json.dump(data, f)

@app.get("/tasks")
def get_tasks():
    return load_tasks()

@app.post("/tasks")
def create_task(task: dict):
    data = load_tasks()
    data["tasks"].append(task)
    save_tasks(data)
    return {"message": "Task added"}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: dict):
    data = load_tasks()
    for i, task in enumerate(data["tasks"]):
        if task["id"] == task_id:
            data["tasks"][i] = updated_task
            save_tasks(data)
            return {"message": "Task updated"}
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    data = load_tasks()
    data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
    save_tasks(data)
    return {"message": "Task deleted"}
