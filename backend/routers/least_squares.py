from fastapi import APIRouter

from routers._common import run_method
from schemas import LeastSquaresRequest
from services.numerical_methods import solve_least_squares

router = APIRouter(prefix="/api/least-squares", tags=["Mínimos Cuadrados"])


@router.post("/solve")
def solve(req: LeastSquaresRequest):
    """Método de Mínimos Cuadrados."""
    return run_method(
        solve_least_squares, "Mínimos Cuadrados",
        points=req.points,
        degree=req.degree,
        evaluate_x=req.evaluate_x,
    )
