from fastapi import APIRouter

from routers._common import run_method
from schemas import GoldenUnivariateRequest
from services.numerical_methods import solve_golden_univariate

router = APIRouter(prefix="/api/golden-univariate", tags=["Sección Áurea"])


@router.post("/solve")
def solve(req: GoldenUnivariateRequest):
    """Método de Sección Áurea."""
    return run_method(
        solve_golden_univariate, "Sección Áurea",
        expr=req.expr,
        a=req.a,
        b=req.b,
        opt_type=req.opt_type,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
