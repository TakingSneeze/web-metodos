"""
Implementación de los 11 métodos numéricos del proyecto final.

Convenciones (Chapra & Canale):
  - Error aproximado:  ea = |(x_nuevo - x_anterior) / x_nuevo| * 100   [%]
  - Cifras significativas n:  es = 0.5 * 10^(2 - n)  [%]
  - Se detiene cuando ea < es (o al llegar al número de iteraciones elegido).

Cada función devuelve un diccionario listo para enviarse como JSON:
tabla de iteraciones con las columnas pedidas en la rúbrica, serie del error
para graficar y resultado final con su error.
"""
import math
from typing import List, Optional

import numpy as np

from services import math_utils as mu
from services.math_utils import approx_error, clean, evaluate, evaluate_or_fail

GOLDEN_R = (math.sqrt(5) - 1) / 2  # razón áurea ≈ 0.618034


def _error_series(rows, key="ea", iter_key="i"):
    return [{"i": r[iter_key], "ea": r[key]} for r in rows if r.get(key) is not None]


def _root_result(root, f_root, rows, converged, es, stop_desc, warning=None, **extra):
    final_error = next((r["ea"] for r in reversed(rows) if r.get("ea") is not None), None)
    out = {
        "success": True,
        "root": clean(root),
        "f_root": clean(f_root),
        "iterations": rows,
        "iterations_count": len(rows),
        "converged": converged,
        "final_error": clean(final_error),
        "es": es,
        "stop_criterion": stop_desc,
        "error_series": _error_series(rows),
        "warning": warning,
    }
    out.update(extra)
    return out


# =====================================================================
# 1. BISECCIÓN
# =====================================================================
def solve_bisection(expr, a, b, stop_mode="cifras", sig_figs=5, tol=None, max_iter=100):
    f = mu.compile_expression(expr).func
    es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)
    xl, xu = (float(a), float(b)) if a < b else (float(b), float(a))
    if xl == xu:
        raise ValueError("Los extremos del intervalo deben ser distintos.")

    f_xl = evaluate_or_fail(f, xl)
    f_xu = evaluate_or_fail(f, xu)
    if f_xl * f_xu > 0:
        raise ValueError(
            f"No hay cambio de signo en [{xl:g}, {xu:g}]: f({xl:g}) = {f_xl:.6g} y f({xu:g}) = {f_xu:.6g}. "
            "Bisección requiere f(xl)·f(xu) < 0. Prueba con otro intervalo."
        )
    if f_xl == 0 or f_xu == 0:
        root = xl if f_xl == 0 else xu
        return _root_result(root, 0.0, [], True, es, stop_desc,
                            warning="Uno de los extremos ya es una raíz exacta.")

    rows, xr_old, converged, warning = [], None, False, None
    xr = xl
    for i in range(1, max_iter + 1):
        xr = (xl + xu) / 2
        f_xr = evaluate_or_fail(f, xr)
        product = f_xl * f_xr
        ea = approx_error(xr, xr_old) if xr_old is not None else None
        rows.append({
            "i": i, "xl": xl, "xu": xu, "xr": xr,
            "f_xl": f_xl, "f_xu": f_xu, "f_xr": f_xr,
            "product": product, "ea": clean(ea),
        })

        if f_xr == 0:
            converged, warning = True, "Se encontró la raíz exacta (f(xr) = 0)."
            break
        if es is not None and ea is not None and ea < es:
            converged = True
            break

        if product < 0:
            xu, f_xu = xr, f_xr
        else:
            xl, f_xl = xr, f_xr
        xr_old = xr

    if es is None:
        converged = True
    return _root_result(xr, evaluate(f, xr), rows, converged, es, stop_desc, warning)


# =====================================================================
# 2. FALSA POSICIÓN
# =====================================================================
def solve_false_position(expr, a, b, stop_mode="cifras", sig_figs=5, tol=None, max_iter=100):
    f = mu.compile_expression(expr).func
    es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)
    xl, xu = (float(a), float(b)) if a < b else (float(b), float(a))
    if xl == xu:
        raise ValueError("Los extremos del intervalo deben ser distintos.")

    f_xl = evaluate_or_fail(f, xl)
    f_xu = evaluate_or_fail(f, xu)
    if f_xl * f_xu > 0:
        raise ValueError(
            f"No hay cambio de signo en [{xl:g}, {xu:g}]: f({xl:g}) = {f_xl:.6g} y f({xu:g}) = {f_xu:.6g}. "
            "Falsa Posición requiere f(xl)·f(xu) < 0. Prueba con otro intervalo."
        )
    if f_xl == 0 or f_xu == 0:
        root = xl if f_xl == 0 else xu
        return _root_result(root, 0.0, [], True, es, stop_desc,
                            warning="Uno de los extremos ya es una raíz exacta.")

    rows, xr_old, converged, warning = [], None, False, None
    xr = xl
    for i in range(1, max_iter + 1):
        xr = xu - f_xu * (xl - xu) / (f_xl - f_xu)
        f_xr = evaluate_or_fail(f, xr)
        ea = approx_error(xr, xr_old) if xr_old is not None else None
        rows.append({
            "i": i, "xl": xl, "xu": xu, "xr": xr,
            "f_xl": f_xl, "f_xu": f_xu, "f_xr": f_xr, "ea": clean(ea),
        })

        if f_xr == 0:
            converged, warning = True, "Se encontró la raíz exacta (f(xr) = 0)."
            break
        if es is not None and ea is not None and ea < es:
            converged = True
            break

        if f_xl * f_xr < 0:
            xu, f_xu = xr, f_xr
        else:
            xl, f_xl = xr, f_xr
        xr_old = xr

    if es is None:
        converged = True
    return _root_result(xr, evaluate(f, xr), rows, converged, es, stop_desc, warning)


# =====================================================================
# 3. NEWTON-RAPHSON
# =====================================================================
def solve_newton_raphson(expr, x0, stop_mode="cifras", sig_figs=5, tol=None, max_iter=100,
                         custom_deriv: Optional[str] = None):
    fc = mu.compile_expression(expr)
    f = fc.func
    if custom_deriv and custom_deriv.strip():
        dfc = mu.compile_expression(custom_deriv)
    else:
        dfc = mu.compile_derivative(fc)
    df = dfc.func
    es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)

    rows, converged, warning = [], False, None
    xi = float(x0)
    for i in range(1, max_iter + 1):
        f_xi = evaluate_or_fail(f, xi)
        df_xi = evaluate_or_fail(df, xi, name="f'")
        if f_xi == 0:
            converged, warning = True, f"x = {xi:.10g} ya es una raíz exacta (f(x) = 0)."
            break
        if abs(df_xi) < 1e-12:
            warning = (f"f'(x) = 0 en x = {xi:.10g} (iteración {i}). Newton-Raphson no puede continuar "
                       "porque dividiría por cero. Elige otro valor inicial x0.")
            if not rows:
                raise ValueError(warning)
            break

        xi1 = xi - f_xi / df_xi
        if not math.isfinite(xi1) or abs(xi1) > 1e15:
            warning = "El método diverge desde este valor inicial. Prueba con otro x0."
            break
        ea = approx_error(xi1, xi)
        rows.append({"i": i, "xi": xi, "f_xi": f_xi, "df_xi": df_xi, "xi1": xi1, "ea": clean(ea)})
        xi = xi1
        if es is not None and ea is not None and ea < es:
            converged = True
            break

    if es is None and warning is None:
        converged = True
    if not converged and warning is None and es is not None:
        warning = f"No se alcanzó el criterio de parada en {max_iter} iteraciones."
    return _root_result(xi, evaluate(f, xi), rows, converged, es, stop_desc, warning,
                        derivative_expr=dfc.text)


# =====================================================================
# 4. SECANTE (dos valores iniciales, sin derivada)
# =====================================================================
def solve_secant(expr, x0, x1, stop_mode="cifras", sig_figs=5, tol=None, max_iter=100):
    f = mu.compile_expression(expr).func
    es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)
    if x0 == x1:
        raise ValueError("La Secante necesita dos valores iniciales distintos (x0 ≠ x1).")

    rows, converged, warning = [], False, None
    x_prev, xi = float(x0), float(x1)
    for i in range(1, max_iter + 1):
        f_prev = evaluate_or_fail(f, x_prev)
        f_xi = evaluate_or_fail(f, xi)
        if f_xi == 0:
            converged, warning = True, f"x = {xi:.10g} ya es una raíz exacta (f(x) = 0)."
            break
        denom = f_prev - f_xi
        if denom == 0:
            warning = (f"f(x_(i-1)) = f(x_i) en la iteración {i}: la secante es horizontal y no corta el eje x. "
                       "Prueba con otros valores iniciales.")
            if not rows:
                raise ValueError(warning)
            break

        x_next = xi - f_xi * (x_prev - xi) / denom
        if not math.isfinite(x_next) or abs(x_next) > 1e15:
            warning = "El método diverge desde estos valores iniciales."
            break
        ea = approx_error(x_next, xi)
        rows.append({"i": i, "x_prev": x_prev, "xi": xi, "f_prev": f_prev, "f_xi": f_xi,
                     "x_next": x_next, "ea": clean(ea)})
        x_prev, xi = xi, x_next
        if es is not None and ea is not None and ea < es:
            converged = True
            break

    if es is None and warning is None:
        converged = True
    if not converged and warning is None and es is not None:
        warning = f"No se alcanzó el criterio de parada en {max_iter} iteraciones."
    return _root_result(xi, evaluate(f, xi), rows, converged, es, stop_desc, warning)


# =====================================================================
# 5-7. INTEGRACIÓN: TRAPECIO, SIMPSON 1/3, SIMPSON 3/8 (compuestas)
# =====================================================================
RULES = {
    "trapezoidal": {"step": 1, "name": "Trapecio"},
    "simpson13": {"step": 2, "name": "Simpson 1/3"},
    "simpson38": {"step": 3, "name": "Simpson 3/8"},
}
MAX_N = 2_000_000


def _nodes(f, a, b, n):
    x = np.linspace(a, b, n + 1)
    with np.errstate(all="ignore"):
        y = f(x)
    y = np.broadcast_to(np.asarray(y, dtype=complex), x.shape)
    if np.any(np.abs(y.imag) > 1e-12) or not np.all(np.isfinite(y.real)):
        bad = x[~np.isfinite(y.real) | (np.abs(y.imag) > 1e-12)][0]
        raise ValueError(f"La función no está definida en x = {bad:.6g}, dentro del intervalo de integración.")
    return x, y.real.astype(float)


def _composite(rule, f, a, b, n):
    """Regla compuesta con n subintervalos. Devuelve (integral, h)."""
    h = (b - a) / n
    _, y = _nodes(f, a, b, n)
    if rule == "trapezoidal":
        integral = h / 2 * (y[0] + 2 * y[1:-1].sum() + y[-1])
    elif rule == "simpson13":
        integral = h / 3 * (y[0] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum() + y[-1])
    else:  # simpson38
        idx = np.arange(1, n)
        inner = np.where(idx % 3 == 0, 2.0, 3.0) * y[1:-1]
        integral = 3 * h / 8 * (y[0] + inner.sum() + y[-1])
    return float(integral), float(h)


def _validate_n(rule, n):
    if n is None or n < 1:
        raise ValueError("El número de subintervalos n debe ser un entero positivo.")
    if rule == "simpson13" and n % 2 != 0:
        raise ValueError(f"Simpson 1/3 exige que n sea par (recibido n = {n}). Prueba con n = {n + 1}.")
    if rule == "simpson38" and n % 3 != 0:
        sug = n + (3 - n % 3)
        raise ValueError(f"Simpson 3/8 exige que n sea múltiplo de 3 (recibido n = {n}). Prueba con n = {sug}.")
    if n > MAX_N:
        raise ValueError(f"n es demasiado grande (máximo {MAX_N}).")


def solve_integration(rule, expr, a, b, n=6, stop_mode="iteraciones", sig_figs=5, tol=None,
                      max_iter=20, exact_value: Optional[float] = None):
    """
    stop_mode = 'iteraciones' -> usa el n dado. La tabla muestra la integral con n = paso, 2·paso, ..., n
                                 para ver cómo baja el error al subir n.
    stop_mode = 'cifras'/'tolerancia' -> empieza con n = paso y duplica n hasta que ea < es.
    """
    if rule not in RULES:
        raise ValueError(f"Regla de integración desconocida: {rule}")
    step = RULES[rule]["step"]
    f = mu.compile_expression(expr).func
    a, b = float(a), float(b)
    if a == b:
        raise ValueError("Los límites de integración a y b deben ser distintos.")

    rows, warning, converged = [], None, True

    def add_row(nk, prev):
        I, h = _composite(rule, f, a, b, nk)
        ea = approx_error(I, prev) if prev is not None else None
        row = {"i": len(rows) + 1, "n": nk, "h": h, "integral": I, "ea": clean(ea)}
        if exact_value is not None:
            row["et"] = clean(abs((exact_value - I) / exact_value) * 100) if exact_value != 0 else clean(abs(exact_value - I))
        rows.append(row)
        return I, ea

    if stop_mode == "iteraciones":
        _validate_n(rule, n)
        K = n // step
        ks = list(range(1, K + 1)) if K <= 60 else sorted(set(np.unique(np.round(np.geomspace(1, K, 60)).astype(int)).tolist() + [K]))
        prev = None
        for k in ks:
            prev, _ = add_row(k * step, prev)
        es, stop_desc = None, f"n = {n} subintervalos"
    else:
        es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)
        nk, prev, converged = step, None, False
        for _ in range(max_iter):
            prev, ea = add_row(nk, prev)
            if ea is not None and ea < es:
                converged = True
                break
            if nk * 2 > MAX_N:
                warning = "Se alcanzó el número máximo de subintervalos sin cumplir el criterio."
                break
            nk *= 2
        if not converged and warning is None:
            warning = f"No se alcanzó el criterio de parada en {max_iter} iteraciones."

    last = rows[-1]
    n_final = last["n"]
    xs, ys = _nodes(f, a, b, n_final) if n_final <= 600 else (np.array([]), np.array([]))
    return {
        "success": True,
        "method": RULES[rule]["name"],
        "integral": clean(last["integral"]),
        "n": n_final,
        "h": clean(last["h"]),
        "a": a,
        "b": b,
        "final_error": last["ea"],
        "true_error": last.get("et"),
        "exact_value": exact_value,
        "iterations": rows,
        "iterations_count": len(rows),
        "converged": converged,
        "es": es,
        "stop_criterion": stop_desc,
        "error_series": _error_series(rows),
        "nodes": [{"x": float(x), "y": float(y)} for x, y in zip(xs, ys)],
        "warning": warning,
    }


def solve_trapezoidal(expr, a, b, n=6, **kw):
    return solve_integration("trapezoidal", expr, a, b, n, **kw)


def solve_simpson_13(expr, a, b, n=6, **kw):
    return solve_integration("simpson13", expr, a, b, n, **kw)


def solve_simpson_38(expr, a, b, n=6, **kw):
    return solve_integration("simpson38", expr, a, b, n, **kw)


# =====================================================================
# Utilidades para polinomios (interpolación y regresión)
# =====================================================================
def _poly_string(coefs_desc, digits=6):
    """Coeficientes de mayor a menor potencia -> 'a*x^2 + b*x + c'."""
    deg = len(coefs_desc) - 1
    terms = []
    for j, c in enumerate(coefs_desc):
        p = deg - j
        if abs(c) < 1e-12:
            continue
        mag = f"{abs(c):.{digits}g}"
        body = mag if p == 0 else (f"{mag}*x" if p == 1 else f"{mag}*x^{p}")
        if p > 0 and mag == "1":
            body = "x" if p == 1 else f"x^{p}"
        sign = ("-" if c < 0 else "") if not terms else (" - " if c < 0 else " + ")
        terms.append(sign + body)
    return "".join(terms) if terms else "0"


def _validate_points(points, min_points):
    pts = []
    for k, p in enumerate(points):
        if len(p) < 2:
            raise ValueError(f"El punto {k + 1} no tiene coordenadas (x, y).")
        x, y = float(p[0]), float(p[1])
        if not (math.isfinite(x) and math.isfinite(y)):
            raise ValueError(f"El punto {k + 1} tiene valores no numéricos.")
        pts.append((x, y))
    if len(pts) < min_points:
        raise ValueError(f"Se necesitan al menos {min_points} puntos (recibidos {len(pts)}).")
    return pts


def _curve(coefs_desc, xs, n=200):
    lo, hi = min(xs), max(xs)
    span = (hi - lo) or 1.0
    px = np.linspace(lo - 0.05 * span, hi + 0.05 * span, n)
    py = np.polyval(coefs_desc, px)
    return [{"x": float(x), "y": float(y)} for x, y in zip(px, py)]


# =====================================================================
# 8. INTERPOLACIÓN DIRECTA (polinomio de grado n con n+1 puntos)
# =====================================================================
def solve_interpolation(points, evaluate_x: Optional[float] = None):
    pts = _validate_points(points, 2)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    if len(set(xs)) != len(xs):
        raise ValueError("Hay valores de x repetidos. En interpolación cada x debe ser único.")
    if len(pts) > 15:
        raise ValueError("Máximo 15 puntos: con más, el polinomio de interpolación es muy inestable.")

    n = len(pts) - 1  # grado
    # Sistema A·a = y con A[i][j] = x_i^(n-j)  (igual que en el cuaderno de la Clase 4)
    A = np.array([[x ** (n - j) for j in range(n + 1)] for x in xs], dtype=float)
    y = np.array(ys, dtype=float)
    try:
        coefs = np.linalg.solve(A, y)
    except np.linalg.LinAlgError:
        raise ValueError("El sistema de ecuaciones es singular; revisa los puntos.")

    warning = None
    cond = float(np.linalg.cond(A))
    if cond > 1e12:
        warning = "El sistema está mal condicionado; los coeficientes pueden tener error de redondeo."

    value = None
    if evaluate_x is not None:
        value = float(np.polyval(coefs, evaluate_x))
        if not (min(xs) <= evaluate_x <= max(xs)):
            warning = (warning + " " if warning else "") + \
                f"x = {evaluate_x:g} está fuera del rango de los datos (extrapolación)."

    return {
        "success": True,
        "polynomial": _poly_string(coefs),
        "equation": _poly_string(coefs),
        "coefficients": [float(c) for c in coefs],  # de mayor a menor potencia
        "degree": n,
        "matrix": A.tolist(),
        "vector": ys,
        "points": [{"x": x, "y": yy} for x, yy in pts],
        "curve": _curve(coefs, xs),
        "evaluated_at": evaluate_x,
        "evaluated_value": clean(value),
        "warning": warning,
    }


# =====================================================================
# 9. MÍNIMOS CUADRADOS (regresión polinomial de grado m)
# =====================================================================
def solve_least_squares(points, degree: int = 1, evaluate_x: Optional[float] = None):
    if degree < 1 or degree > 10:
        raise ValueError("El grado del polinomio debe estar entre 1 y 10.")
    pts = _validate_points(points, degree + 1)
    xs = np.array([p[0] for p in pts], dtype=float)
    ys = np.array([p[1] for p in pts], dtype=float)
    if len(set(xs.tolist())) < degree + 1:
        raise ValueError(f"Para un polinomio de grado {degree} se necesitan al menos {degree + 1} valores de x distintos.")

    m = degree
    # Ecuaciones normales: sum(x^(i+j)) * a_j = sum(x^i * y)
    N = np.array([[np.sum(xs ** (i + j)) for j in range(m + 1)] for i in range(m + 1)])
    rhs = np.array([np.sum(xs ** i * ys) for i in range(m + 1)])
    # Se resuelve con lstsq sobre la matriz de Vandermonde (mismo resultado, más estable numéricamente)
    V = np.vander(xs, m + 1, increasing=True)
    coefs_asc, *_ = np.linalg.lstsq(V, ys, rcond=None)
    coefs_desc = coefs_asc[::-1]

    y_pred = np.polyval(coefs_desc, xs)
    St = float(np.sum((ys - ys.mean()) ** 2))
    Sr = float(np.sum((ys - y_pred) ** 2))
    r2 = 1 - Sr / St if St > 0 else 1.0
    dof = len(xs) - (m + 1)
    syx = math.sqrt(Sr / dof) if dof > 0 else None

    value = float(np.polyval(coefs_desc, evaluate_x)) if evaluate_x is not None else None
    result = {
        "success": True,
        "equation": _poly_string(coefs_desc),
        "coefficients": [float(c) for c in coefs_desc],        # de mayor a menor potencia
        "coefficients_ascending": [float(c) for c in coefs_asc],  # a0, a1, ..., am
        "degree": m,
        "r_squared": clean(r2),
        "r": clean(math.sqrt(max(r2, 0.0))),
        "Sr": Sr,
        "St": St,
        "std_error": clean(syx),
        "normal_matrix": N.tolist(),
        "normal_rhs": rhs.tolist(),
        "points": [{"x": float(x), "y": float(y)} for x, y in zip(xs, ys)],
        "residuals": [{"x": float(x), "y": float(y), "y_pred": float(yp), "residual": float(y - yp)}
                      for x, y, yp in zip(xs, ys, y_pred)],
        "curve": _curve(coefs_desc, xs.tolist()),
        "evaluated_at": evaluate_x,
        "evaluated_value": clean(value),
        "warning": None,
    }
    if m == 1:
        result["slope"] = float(coefs_desc[0])
        result["intercept"] = float(coefs_desc[1])
    return result


# =====================================================================
# 10. SECCIÓN ÁUREA (una variable) — máximo o mínimo
# =====================================================================
def _golden_core(g, xl, xu, opt_type, es, max_iter):
    """
    Sección áurea (Chapra, cap. 13). g es una función de una variable.
    Reutiliza un punto interior en cada iteración: solo evalúa g una vez por iteración.
    """
    if not xl < xu:
        raise ValueError("El intervalo debe cumplir xl < xu.")
    better = (lambda f1, f2: f1 > f2) if opt_type == "max" else (lambda f1, f2: f1 < f2)

    def g_ok(x):
        return evaluate_or_fail(g, x)

    d = GOLDEN_R * (xu - xl)
    x1, x2 = xl + d, xu - d
    f1, f2 = g_ok(x1), g_ok(x2)
    evals = 2
    rows, converged = [], False
    xopt, fopt = (x1, f1) if better(f1, f2) else (x2, f2)

    for i in range(1, max_iter + 1):
        xopt, fopt = (x1, f1) if better(f1, f2) else (x2, f2)
        if xopt != 0:
            ea = (1 - GOLDEN_R) * abs((xu - xl) / xopt) * 100
        else:
            ea = (1 - GOLDEN_R) * abs(xu - xl) * 100
        rows.append({"i": i, "xl": xl, "xu": xu, "x1": x1, "x2": x2, "f_x1": f1, "f_x2": f2,
                     "d": d, "xopt": xopt, "f_opt": fopt, "ea": ea})
        if es is not None and ea < es:
            converged = True
            break
        if i == max_iter:
            break
        # Se reutiliza un punto interior: el viejo x1 pasa a ser x2 (o viceversa)
        if better(f1, f2):
            xl = x2
            x2, f2 = x1, f1
            d = GOLDEN_R * (xu - xl)
            x1 = xl + d
            f1 = g_ok(x1)
            rows[-1]["reused"] = "x2 ← x1"
        else:
            xu = x1
            x1, f1 = x2, f2
            d = GOLDEN_R * (xu - xl)
            x2 = xu - d
            f2 = g_ok(x2)
            rows[-1]["reused"] = "x1 ← x2"
        evals += 1

    if es is None:
        converged = True
    return xopt, fopt, rows, converged, evals


def solve_golden_univariate(expr, a, b, opt_type="max", stop_mode="cifras", sig_figs=5, tol=None, max_iter=100):
    if opt_type not in ("max", "min"):
        raise ValueError("opt_type debe ser 'max' o 'min'.")
    f = mu.compile_expression(expr).func
    es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)
    xl, xu = (float(a), float(b)) if a < b else (float(b), float(a))
    if xl == xu:
        raise ValueError("Los extremos del intervalo deben ser distintos.")

    xopt, fopt, rows, converged, evals = _golden_core(f, xl, xu, opt_type, es, max_iter)
    warning = None
    if not converged:
        warning = f"No se alcanzó el criterio de parada en {max_iter} iteraciones."
    return {
        "success": True,
        "optimal_x": xopt,
        "optimal_f": fopt,
        "opt_type": opt_type,
        "iterations": rows,
        "iterations_count": len(rows),
        "function_evaluations": evals,
        "converged": converged,
        "final_error": rows[-1]["ea"] if rows else None,
        "es": es,
        "stop_criterion": stop_desc,
        "error_series": _error_series(rows),
        "golden_ratio": GOLDEN_R,
        "warning": warning,
    }


# =====================================================================
# 11. SECCIÓN ÁUREA MULTIVARIADA (búsqueda por coordenadas / univariada alternada)
# =====================================================================
def solve_golden_multivariate(expr, x_bounds: List[float], y_bounds: List[float], opt_type="min",
                              stop_mode="cifras", sig_figs=5, tol=None, max_iter=50,
                              initial_x: Optional[float] = None, initial_y: Optional[float] = None):
    """
    En cada ciclo se optimiza x con y fija (sección áurea en x_bounds) y luego y con x fija
    (sección áurea en y_bounds), como en el cuaderno del Parcial del Segundo Corte.
    """
    if opt_type not in ("max", "min"):
        raise ValueError("opt_type debe ser 'max' o 'min'.")
    f = mu.compile_expression(expr, ("x", "y")).func
    es, max_iter, stop_desc = mu.resolve_stop(stop_mode, sig_figs, tol, max_iter)
    bounds = {}
    for name, bnd in (("x", x_bounds), ("y", y_bounds)):
        if bnd is None or len(bnd) != 2 or not bnd[0] < bnd[1]:
            raise ValueError(f"El intervalo de {name} debe ser [mínimo, máximo] con mínimo < máximo.")
        bounds[name] = (float(bnd[0]), float(bnd[1]))

    point = {
        "x": float(initial_x) if initial_x is not None else sum(bounds["x"]) / 2,
        "y": float(initial_y) if initial_y is not None else sum(bounds["y"]) / 2,
    }
    for v in ("x", "y"):
        lo, hi = bounds[v]
        if not lo <= point[v] <= hi:
            raise ValueError(f"El punto inicial {v} = {point[v]:g} está fuera de su intervalo [{lo:g}, {hi:g}].")
    f_point = evaluate_or_fail(f, point["x"], point["y"])

    # Las búsquedas 1D internas se hacen con 2 cifras más de precisión que el criterio externo
    inner_es = (es / 100) if es is not None else mu.tolerance_from_sig_figs(8)

    steps, cycles, converged = [], [], False
    for cycle in range(1, max_iter + 1):
        old = dict(point)
        for var in ("x", "y"):
            if var == "x":
                g = (lambda yv: (lambda t: f(t, yv)))(point["y"])
            else:
                g = (lambda xv: (lambda t: f(xv, t)))(point["x"])
            lo, hi = bounds[var]
            xopt, fopt, sub, _, _ = _golden_core(g, lo, hi, opt_type, inner_es, 200)
            point[var] = xopt
            f_point = fopt
            last = sub[-1]
            steps.append({
                "step": len(steps) + 1, "cycle": cycle, "active": var,
                "xl": last["xl"], "xu": last["xu"], "x1": last["x1"], "x2": last["x2"],
                "f_x1": last["f_x1"], "f_x2": last["f_x2"], "ea_inner": last["ea"],
                "inner_iterations": len(sub),
                "x": point["x"], "y": point["y"], "f_point": f_point,
                "sub_iterations": sub,
            })

        errs = [approx_error(point[v], old[v]) for v in ("x", "y")]
        errs = [e if e is not None else 0.0 for e in errs]
        ea = max(errs)
        steps[-1]["ea"] = ea
        cycles.append({"i": cycle, "x": point["x"], "y": point["y"], "f": f_point, "ea": ea})
        if es is not None and ea < es:
            converged = True
            break

    if es is None:
        converged = True
    warning = None if converged else f"No se alcanzó el criterio de parada en {max_iter} ciclos."
    return {
        "success": True,
        "optimal_x": point["x"],
        "optimal_y": point["y"],
        "optimal_f": f_point,
        "opt_type": opt_type,
        "iterations": cycles,          # un renglón por ciclo (x, y, f, ea)
        "steps": steps,                # un renglón por búsqueda 1D (coordenada activa y punto actual)
        "iterations_count": len(cycles),
        "converged": converged,
        "final_error": cycles[-1]["ea"] if cycles else None,
        "es": es,
        "stop_criterion": stop_desc,
        "error_series": _error_series(cycles),
        "warning": warning,
    }
