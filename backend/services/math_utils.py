"""
Utilidades compartidas por todos los métodos numéricos:
  - Lectura y validación de la expresión matemática que escribe el usuario.
  - Evaluación segura de f(x) / f(x, y).
  - Criterio de parada (cifras significativas, número de iteraciones o tolerancia).
  - Cálculo del error aproximado porcentual.
"""
import math
import re
from dataclasses import dataclass
from typing import Callable, Optional, Sequence

import numpy as np

try:  # sympy solo se importa si está instalado (en el servidor siempre lo está)
    import sympy as sp
    from sympy.parsing.sympy_parser import (
        implicit_multiplication,
        parse_expr,
        standard_transformations,
    )
except ImportError:  # pragma: no cover
    sp = None


# ------------------------------------------------------------------
# Expresiones
# ------------------------------------------------------------------
@dataclass
class CompiledExpr:
    text: str            # Expresión ya interpretada (forma legible)
    func: Callable       # Función numérica f(*vars)
    sym: object = None   # Expresión simbólica de sympy (para derivar)
    vars: tuple = ()     # Símbolos de sympy de las variables


def _local_dict(var_names: Sequence[str]):
    """Nombres que el usuario puede escribir además de los de sympy."""
    d = {
        "e": sp.E, "E": sp.E, "pi": sp.pi, "PI": sp.pi,
        "sen": sp.sin, "tg": sp.tan, "ln": sp.log, "log": sp.log,
        "log10": lambda z: sp.log(z, 10), "raiz": sp.sqrt, "sqrt": sp.sqrt,
        "abs": sp.Abs, "exp": sp.exp,
        "asin": sp.asin, "acos": sp.acos, "atan": sp.atan,
        "arcsin": sp.asin, "arccos": sp.acos, "arctan": sp.atan,
        "sinh": sp.sinh, "cosh": sp.cosh, "tanh": sp.tanh,
    }
    for v in var_names:
        d[v] = sp.Symbol(v, real=True)
    return d


def compile_expression(expr_str: str, var_names: Sequence[str] = ("x",)) -> CompiledExpr:
    """
    Convierte el texto del usuario en una función numérica.
    Acepta: ^ o ** para potencias, 2x (multiplicación implícita), sen, ln, e, pi, sqrt, abs, exp...
    Lanza ValueError con un mensaje claro si la expresión no es válida.
    """
    if sp is None:
        raise RuntimeError("Falta instalar sympy (pip install sympy).")
    if expr_str is None or not str(expr_str).strip():
        raise ValueError("La expresión está vacía. Escribe una función, por ejemplo: x^3 - x - 2")

    text = str(expr_str).strip()
    if "=" in text:
        raise ValueError("Escribe solo la expresión de la función, sin '=' (ej: x^3 - x - 2).")
    if len(text) > 300:
        raise ValueError("La expresión es demasiado larga (máximo 300 caracteres).")
    if re.search(r"[;_`\\$@#!?\"']", text) or "__" in text or "lambda" in text:
        raise ValueError("La expresión contiene caracteres no permitidos.")

    text = text.replace("^", "**").replace("×", "*").replace("÷", "/")

    local = _local_dict(var_names)
    try:
        sym = parse_expr(
            text,
            local_dict=local,
            transformations=standard_transformations + (implicit_multiplication,),
            evaluate=True,
        )
    except Exception:
        raise ValueError(
            f"No se pudo interpretar la expresión '{expr_str}'. Revisa paréntesis y operadores "
            "(usa * para multiplicar y ^ para potencias)."
        )

    if not isinstance(sym, sp.Expr):
        raise ValueError(f"'{expr_str}' no es una expresión matemática válida.")

    allowed = {local[v] for v in var_names}
    extra = sorted(str(s) for s in sym.free_symbols if s not in allowed)
    if extra:
        permitidas = ", ".join(var_names)
        raise ValueError(
            f"Variable(s) no reconocida(s): {', '.join(extra)}. Solo puedes usar: {permitidas}."
        )
    undefined = sym.atoms(sp.core.function.AppliedUndef)
    if undefined:
        nombres = ", ".join(sorted(str(u.func) for u in undefined))
        raise ValueError(f"Función desconocida: {nombres}. Usa sin, cos, tan, exp, ln, log, sqrt, abs...")

    sym_vars = tuple(local[v] for v in var_names)
    func = sp.lambdify(sym_vars, sym, modules=["numpy"])
    return CompiledExpr(text=sp.sstr(sym), func=func, sym=sym, vars=sym_vars)


def compile_derivative(compiled: CompiledExpr) -> CompiledExpr:
    """Derivada simbólica exacta respecto a la primera variable."""
    if sp is None:
        raise RuntimeError("Falta instalar sympy (pip install sympy).")
    d = sp.diff(compiled.sym, compiled.vars[0])
    func = sp.lambdify(compiled.vars, d, modules=["numpy"])
    return CompiledExpr(text=sp.sstr(d), func=func, sym=d, vars=compiled.vars)


def evaluate(func: Callable, *args) -> Optional[float]:
    """Evalúa la función y devuelve un float finito, o None si no está definida (log(-1), 1/0...)."""
    try:
        with np.errstate(all="ignore"):
            val = func(*args)
        val = complex(val)
        if abs(val.imag) > 1e-12:
            return None
        val = float(val.real)
    except Exception:
        return None
    if math.isnan(val) or math.isinf(val):
        return None
    return val


def evaluate_or_fail(func: Callable, *args, name: str = "f") -> float:
    val = evaluate(func, *args)
    if val is None:
        pts = ", ".join(f"{a:g}" for a in args)
        raise ValueError(f"{name}({pts}) no está definida (división por cero, raíz o logaritmo de negativo...).")
    return val


# ------------------------------------------------------------------
# Criterio de parada y error
# ------------------------------------------------------------------
def tolerance_from_sig_figs(n: int) -> float:
    """Criterio de Scarborough: es = 0.5 x 10^(2-n) %."""
    return 0.5 * 10 ** (2 - n)


def resolve_stop(stop_mode: str, sig_figs: int, tol: Optional[float], max_iter: int):
    """
    Devuelve (es, max_iter, descripcion).
      - 'cifras'      -> para cuando ea < es = 0.5*10^(2-n) %  (con max_iter como límite de seguridad)
      - 'tolerancia'  -> para cuando ea < tol (%)
      - 'iteraciones' -> hace exactamente max_iter iteraciones (es = None)
    """
    if stop_mode == "iteraciones":
        return None, max_iter, f"{max_iter} iteraciones"
    if stop_mode == "tolerancia":
        if tol is None or tol <= 0:
            raise ValueError("La tolerancia debe ser un número positivo (en %).")
        return float(tol), max_iter, f"ea < {tol:g} %"
    es = tolerance_from_sig_figs(sig_figs)
    return es, max_iter, f"{sig_figs} cifras significativas (es = {es:g} %)"


def approx_error(new: float, old: float) -> Optional[float]:
    """Error relativo porcentual aproximado: |(nuevo - anterior) / nuevo| * 100."""
    if new == 0:
        return None if new == old else 100.0
    return abs((new - old) / new) * 100.0


def clean(v):
    """Convierte floats no finitos a None para que el JSON sea válido."""
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return v
    return f if math.isfinite(f) else None
