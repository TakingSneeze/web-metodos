"""
API de Métodos Numéricos (FastAPI).

Ejecutar en local (desde la carpeta backend):
    uvicorn main:app --reload --port 8000
En Render (rootDir = backend):
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""
import os
import sys

# Permite importar "routers", "services" y "schemas" sin importar desde dónde se lance
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.exceptions import RequestValidationError  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from routers.bisection import router as bisection_router  # noqa: E402
from routers.false_position import router as false_position_router  # noqa: E402
from routers.golden_multivariate import router as golden_multivariate_router  # noqa: E402
from routers.golden_univariate import router as golden_univariate_router  # noqa: E402
from routers.interpolation import router as interpolation_router  # noqa: E402
from routers.least_squares import router as least_squares_router  # noqa: E402
from routers.newton_raphson import router as newton_raphson_router  # noqa: E402
from routers.secant import router as secant_router  # noqa: E402
from routers.simpson_13 import router as simpson_13_router  # noqa: E402
from routers.simpson_38 import router as simpson_38_router  # noqa: E402
from routers.trapezoidal import router as trapezoidal_router  # noqa: E402
from schemas import ValidateRequest  # noqa: E402
from services import math_utils as mu  # noqa: E402

app = FastAPI(
    title="API de Métodos Numéricos",
    description="Raíces, integración, interpolación, regresión y optimización.",
    version="2.0.0",
)

# CORS: por defecto permite todo. En producción se puede limitar con la variable
# de entorno CORS_ORIGINS="https://mi-app.vercel.app,http://localhost:5173"
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials="*" not in origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

FIELD_NAMES = {
    "expr": "función", "a": "a", "b": "b", "x0": "x0", "x1": "x1", "n": "n",
    "sig_figs": "cifras significativas", "max_iter": "máximo de iteraciones", "tol": "tolerancia",
    "points": "puntos", "degree": "grado", "x_bounds": "intervalo de x", "y_bounds": "intervalo de y",
    "stop_mode": "criterio de parada", "opt_type": "tipo de optimización",
}


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    msgs = []
    for err in exc.errors():
        loc = [str(p) for p in err.get("loc", []) if p != "body"]
        campo = FIELD_NAMES.get(loc[0], loc[0]) if loc else "datos"
        msgs.append(f"Campo '{campo}': {err.get('msg')}")
    return JSONResponse(status_code=422, content={"detail": "Datos inválidos. " + " | ".join(msgs)})


for r in (
    bisection_router, false_position_router, newton_raphson_router, secant_router,
    trapezoidal_router, simpson_13_router, simpson_38_router,
    interpolation_router, least_squares_router,
    golden_univariate_router, golden_multivariate_router,
):
    app.include_router(r)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Backend de Métodos Numéricos funcionando.",
        "docs_url": "/docs",
        "methods_count": 11,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/validate")
def validate_expression(req: ValidateRequest):
    """Valida la expresión mientras el usuario escribe. Devuelve la forma interpretada (y f'(x) si es de una variable)."""
    try:
        c = mu.compile_expression(req.expr, tuple(req.variables))
        out = {"valid": True, "parsed": c.text}
        if len(req.variables) == 1:
            out["derivative"] = mu.compile_derivative(c).text
        return out
    except ValueError as e:
        return {"valid": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
