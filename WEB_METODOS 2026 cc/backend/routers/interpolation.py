from fastapi import APIRouter

from routers._common import run_method
from schemas import InterpolationRequest
from services.numerical_methods import solve_interpolation

router = APIRouter(prefix="/api/interpolation", tags=["Interpolación Directa"])


@router.post("/solve")
def solve(req: InterpolationRequest):
    """Método de Interpolación Directa."""
    return run_method(
        solve_interpolation, "Interpolación Directa",
        points=req.points,
        evaluate_x=req.evaluate_x,
    )
