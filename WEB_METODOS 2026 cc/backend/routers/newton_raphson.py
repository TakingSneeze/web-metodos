from fastapi import APIRouter

from routers._common import run_method
from schemas import NewtonRaphsonRequest
from services.numerical_methods import solve_newton_raphson

router = APIRouter(prefix="/api/newton-raphson", tags=["Newton-Raphson"])


@router.post("/solve")
def solve(req: NewtonRaphsonRequest):
    """Método de Newton-Raphson."""
    return run_method(
        solve_newton_raphson, "Newton-Raphson",
        expr=req.expr,
        x0=req.x0,
        custom_deriv=req.custom_deriv,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
