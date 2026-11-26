from fastapi import APIRouter

from routers._common import run_method
from schemas import TrapezoidalRequest
from services.numerical_methods import solve_trapezoidal

router = APIRouter(prefix="/api/trapezoidal", tags=["Trapecio"])


@router.post("/solve")
def solve(req: TrapezoidalRequest):
    """Método de Trapecio."""
    return run_method(
        solve_trapezoidal, "Trapecio",
        expr=req.expr,
        a=req.a,
        b=req.b,
        n=req.n,
        exact_value=req.exact_value,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
