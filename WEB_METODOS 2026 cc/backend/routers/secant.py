from fastapi import APIRouter

from routers._common import run_method
from schemas import SecantRequest
from services.numerical_methods import solve_secant

router = APIRouter(prefix="/api/secant", tags=["Secante"])


@router.post("/solve")
def solve(req: SecantRequest):
    """Método de Secante."""
    return run_method(
        solve_secant, "Secante",
        expr=req.expr,
        x0=req.x0,
        x1=req.x1,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
