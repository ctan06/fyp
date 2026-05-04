from core.logging import setup_logging

setup_logging()  # MUST be first

import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from routes import ansible
from routes import auth
from routes import router as router_routes

app = FastAPI()

logger = logging.getLogger("api.requests")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()

    response = await call_next(request)

    duration = time.time() - start

    logger.info(
        f"{request.client.host} "
        f"{request.method} {request.url.path} "
        f"status={response.status_code} "
        f"duration={duration:.3f}s"
    )

    return response

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