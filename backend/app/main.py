from core.logging import setup_logging
setup_logging()  # MUST be first

import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from jobs import scheduled_fetch_all_configs

from routes import ansible
from routes import auth
from routes import router as router_routes
from routes import router_configs

logger = logging.getLogger("api.requests")
scheduler_logger = logging.getLogger("api.scheduler")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        scheduled_fetch_all_configs,
        "interval",
        minutes=30,
        id="fetch_all_configs"
    )
    scheduler.start()
    scheduler_logger.info("Scheduler started.")

    yield  # app runs here

    # Shutdown
    scheduler.shutdown()
    scheduler_logger.info("Scheduler stopped.")

app = FastAPI(lifespan=lifespan)

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
    allow_origins=["http://localhost:5173", "https://fyp-kappa-woad.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(ansible.router, prefix="/ansible", tags=["Ansible"])
app.include_router(router_configs.router, prefix="/router-configs", tags=["Router Configurations"])
app.include_router(router_routes.router, prefix="/routers", tags=["Routers"])