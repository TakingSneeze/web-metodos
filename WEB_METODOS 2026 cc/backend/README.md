# Backend – Métodos Numéricos (FastAPI)

## Ejecutar en local

```powershell
cd backend
pip install -r requirements.txt
python test_metodos.py          # corre los casos de prueba de la rúbrica
uvicorn main:app --reload --port 8000
```

Documentación interactiva: http://localhost:8000/docs
(También funciona `python run_backend.py` desde la carpeta raíz.)

## Despliegue en Render

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health`
- Opcional: variable `CORS_ORIGINS=https://tu-app.vercel.app` (si no se define, se permite cualquier origen).

## Criterio de parada (común a raíces, integración y optimización)

| Campo | Valores | Significado |
|---|---|---|
| `stop_mode` | `"cifras"` | Para cuando ea < es = 0.5·10^(2−n) %, con n = `sig_figs` |
|  | `"iteraciones"` | Hace exactamente `max_iter` iteraciones (en integración: usa los `n` subintervalos dados) |
|  | `"tolerancia"` | Para cuando ea < `tol` (en %) |
| `sig_figs` | 1–15 | Cifras significativas |
| `max_iter` | entero | Límite de iteraciones |

Error aproximado: ea = |(x_nuevo − x_anterior) / x_nuevo| · 100 %.

## Endpoints (todos `POST`, cuerpo JSON)

| Método | Endpoint | Entrada principal | Columnas de `iterations` |
|---|---|---|---|
| Bisección | `/api/bisection/solve` | `expr, a, b` | `i, xl, xu, xr, f_xl, f_xr, product, ea` (+ `f_xu`) |
| Falsa Posición | `/api/false-position/solve` | `expr, a, b` | `i, xl, xu, xr, f_xl, f_xu, f_xr, ea` |
| Newton-Raphson | `/api/newton-raphson/solve` | `expr, x0, custom_deriv?` | `i, xi, f_xi, df_xi, xi1, ea` |
| Secante | `/api/secant/solve` | `expr, x0, x1` | `i, x_prev, xi, f_prev, f_xi, x_next, ea` |
| Trapecio | `/api/trapezoidal/solve` | `expr, a, b, n, exact_value?` | `i, n, h, integral, ea` (+ `et` si hay valor exacto) |
| Simpson 1/3 | `/api/simpson-13/solve` | ídem (n par) | ídem |
| Simpson 3/8 | `/api/simpson-38/solve` | ídem (n múltiplo de 3) | ídem |
| Interpolación directa | `/api/interpolation/solve` | `points [[x,y],...], evaluate_x?` | — (devuelve `coefficients`, `polynomial`, `matrix`, `curve`, `evaluated_value`) |
| Mínimos cuadrados | `/api/least-squares/solve` | `points, degree, evaluate_x?` | — (devuelve `equation`, `coefficients`, `slope`, `intercept`, `r_squared`, `residuals`, `curve`) |
| Sección áurea | `/api/golden-univariate/solve` | `expr, a, b, opt_type ("max"/"min")` | `i, xl, xu, x1, x2, f_x1, f_x2, d, xopt, f_opt, ea, reused` |
| Sección áurea multivariada | `/api/golden-multivariate/solve` | `expr(x,y), x_bounds, y_bounds, opt_type, initial_x?, initial_y?` | `iterations`: `i, x, y, f, ea` por ciclo; `steps`: `step, cycle, active, xl, xu, x1, x2, f_x1, f_x2, x, y, f_point, ea` por búsqueda |

Todas las respuestas incluyen también: resultado final, `final_error`, `converged`,
`error_series` (lista `{i, ea}` lista para la gráfica del error) y `warning`
(aviso no fatal, p. ej. f'(x) = 0 en Newton). Los errores de entrada devuelven
HTTP 400/422 con un mensaje en español en `detail`.

Extra: `POST /api/validate` con `{"expr": "...", "variables": ["x"]}` valida la expresión
mientras el usuario escribe y devuelve su derivada.

## Expresiones aceptadas

`x^3 - x - 2`, `2x^2 + 3x`, `sen(x)`, `cos(x)`, `tan(x)`, `exp(x)`, `e^x`, `ln(x)`,
`log10(x)`, `sqrt(x)`, `abs(x)`, `pi`. Para dos variables: `(x - 1)^2 + (y + 2)^2`.
