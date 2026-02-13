from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import ansible  
from routes import auth
from routes import router as router_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(ansible.router, prefix="/ansible", tags=["Ansible"])
app.include_router(router_routes.router, prefix="/routers", tags=["Routers"])