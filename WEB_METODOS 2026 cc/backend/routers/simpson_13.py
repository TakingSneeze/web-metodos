from fastapi import APIRouter

from routers._common import run_method
from schemas import Simpson13Request
from services.numerical_methods import solve_simpson_13

router = APIRouter(prefix="/api/simpson-13", tags=["Simpson 1/3"])


@router.post("/solve")
def solve(req: Simpson13Request):
    """Método de Simpson 1/3."""
    return run_method(
        solve_simpson_13, "Simpson 1/3",
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
