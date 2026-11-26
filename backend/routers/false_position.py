from fastapi import APIRouter

from routers._common import run_method
from schemas import FalsePositionRequest
from services.numerical_methods import solve_false_position

router = APIRouter(prefix="/api/false-position", tags=["Falsa Posición"])


@router.post("/solve")
def solve(req: FalsePositionRequest):
    """Método de Falsa Posición."""
    return run_method(
        solve_false_position, "Falsa Posición",
        expr=req.expr,
        a=req.a,
        b=req.b,
        stop_mode=req.stop_mode,
        sig_figs=req.sig_figs,
        tol=req.tol,
        max_iter=req.max_iter,
    )
