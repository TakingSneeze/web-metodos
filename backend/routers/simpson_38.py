from fastapi import APIRouter

from routers._common import run_method
from schemas import Simpson38Request
from services.numerical_methods import solve_simpson_38

router = APIRouter(prefix="/api/simpson-38", tags=["Simpson 3/8"])


@router.post("/solve")
def solve(req: Simpson38Request):
    """Método de Simpson 3/8."""
    return run_method(
        solve_simpson_38, "Simpson 3/8",
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
