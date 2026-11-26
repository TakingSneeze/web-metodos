from fastapi import APIRouter, HTTPException
from backend.schemas import Simpson18Request
from backend.services.numerical_methods import solve_simpson_18

router = APIRouter(prefix="/api/simpson-18", tags=["Simpson 1/8"])

@router.post("/solve")
def compute_simpson_18(req: Simpson18Request):
    """
    Endpoint dedicado exclusivamente a la Regla de Simpson 1/8 (Método adaptativo).
    """
    try:
        result = solve_simpson_18(
            expr=req.expr,
            a=req.a,
            b=req.b,
            n=req.n
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno en Simpson 1/8: {str(e)}")
