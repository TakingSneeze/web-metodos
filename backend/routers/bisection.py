from fastapi import APIRouter

from routers._common import run_method
from schemas import BisectionRequest
from services.numerical_methods import solve_bisection

router = APIRouter(prefix="/api/bisection", tags=["Bisección"])


@router.post("/solve")
def solve(req: BisectionRequest):
    """Método de Bisección."""
    return run_method(
        solve_bisection, "Bisección",
        expr=req.expr,
        a=req.a,
        b=req.b,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
