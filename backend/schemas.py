from typing import List, Literal, Optional

from pydantic import BaseModel, Field

StopMode = Literal["cifras", "iteraciones", "tolerancia"]


class StopParams(BaseModel):
    """
    Criterio de parada (selector de la interfaz):
      - "cifras": para cuando ea < es = 0.5·10^(2-n) %, con n = sig_figs.
      - "iteraciones": hace exactamente max_iter iteraciones.
      - "tolerancia": para cuando ea < tol (en %).
    """
    stop_mode: StopMode = Field("cifras", examples=["cifras"])
    sig_figs: int = Field(5, ge=1, le=15, examples=[5])
    max_iter: int = Field(100, ge=1, le=1000, examples=[100])
    tol: Optional[float] = Field(None, gt=0, examples=[0.0005])


# --- Raíces ---
class BisectionRequest(StopParams):
    expr: str = Field(..., examples=["x^3 - x - 2"])
    a: float = Field(..., examples=[1.0])
    b: float = Field(..., examples=[2.0])


class FalsePositionRequest(BisectionRequest):
    pass


class NewtonRaphsonRequest(StopParams):
    expr: str = Field(..., examples=["x^3 - x - 2"])
    x0: float = Field(..., examples=[1.5])
    custom_deriv: Optional[str] = Field(None, examples=[None],
                                        description="Opcional. Si se omite, f'(x) se calcula simbólicamente.")


class SecantRequest(StopParams):
    expr: str = Field(..., examples=["x^3 - x - 2"])
    x0: float = Field(..., examples=[1.0])
    x1: float = Field(..., examples=[2.0])


# --- Integración ---
class IntegrationRequest(BaseModel):
    """
    stop_mode = "iteraciones" -> usa los n subintervalos dados (tabla con n creciente hasta n).
    stop_mode = "cifras"/"tolerancia" -> duplica n hasta cumplir el criterio (max_iter duplicaciones).
    """
    expr: str = Field(..., examples=["sin(x)"])
    a: float = Field(..., examples=[0.0])
    b: float = Field(..., examples=[3.141592653589793])
    n: int = Field(6, ge=1, le=2_000_000, examples=[6])
    stop_mode: StopMode = Field("iteraciones", examples=["iteraciones"])
    sig_figs: int = Field(5, ge=1, le=15)
    tol: Optional[float] = Field(None, gt=0)
    max_iter: int = Field(20, ge=1, le=25)
    exact_value: Optional[float] = Field(None, examples=[2.0],
                                         description="Opcional: valor exacto para calcular el error verdadero.")


class TrapezoidalRequest(IntegrationRequest):
    pass


class Simpson13Request(IntegrationRequest):
    pass


class Simpson38Request(IntegrationRequest):
    pass


# --- Interpolación y regresión ---
class InterpolationRequest(BaseModel):
    points: List[List[float]] = Field(..., examples=[[[1, 1], [2, 8], [3, 27]]])
    evaluate_x: Optional[float] = Field(None, examples=[2.5])


class LeastSquaresRequest(BaseModel):
    points: List[List[float]] = Field(..., examples=[[[1, 2], [2, 4.1], [3, 5.9], [4, 8.2]]])
    degree: int = Field(1, ge=1, le=10, examples=[1])
    evaluate_x: Optional[float] = Field(None, examples=[5.0])


# --- Optimización ---
class GoldenUnivariateRequest(StopParams):
    expr: str = Field(..., examples=["2*sin(x) - x^2/10"])
    a: float = Field(..., examples=[0.0])
    b: float = Field(..., examples=[4.0])
    opt_type: Literal["max", "min"] = Field("max", examples=["max"])


class GoldenMultivariateRequest(StopParams):
    expr: str = Field(..., examples=["(x - 1)^2 + (y + 2)^2"])
    x_bounds: List[float] = Field(..., min_length=2, max_length=2, examples=[[-5.0, 5.0]])
    y_bounds: List[float] = Field(..., min_length=2, max_length=2, examples=[[-5.0, 5.0]])
    opt_type: Literal["max", "min"] = Field("min", examples=["min"])
    initial_x: Optional[float] = Field(None, examples=[0.0])
    initial_y: Optional[float] = Field(None, examples=[0.0])
    max_iter: int = Field(50, ge=1, le=200)


# --- Validación de expresiones ---
class ValidateRequest(BaseModel):
    expr: str = Field(..., examples=["x^3 - x - 2"])
    variables: List[str] = Field(["x"], examples=[["x"]])
