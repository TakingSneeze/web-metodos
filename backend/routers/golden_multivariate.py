from fastapi import APIRouter

from routers._common import run_method
from schemas import GoldenMultivariateRequest
from services.numerical_methods import solve_golden_multivariate

router = APIRouter(prefix="/api/golden-multivariate", tags=["Sección Áurea Multivariada"])


@router.post("/solve")
def solve(req: GoldenMultivariateRequest):
    """Método de Sección Áurea Multivariada."""
    return run_method(
        solve_golden_multivariate, "Sección Áurea Multivariada",
        expr=req.expr,
        x_bounds=req.x_bounds,
        y_bounds=req.y_bounds,
        opt_type=req.opt_type,
        initial_x=req.initial_x,
        initial_y=req.initial_y,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
