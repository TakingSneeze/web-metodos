"""
Pruebas de los 11 métodos con los casos de la rúbrica.
Ejecutar desde la carpeta backend:   python test_metodos.py
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services import numerical_methods as nm  # noqa: E402

PASSED, FAILED = [], []


def check(name, got, expected, tol):
    ok = got is not None and abs(got - expected) <= tol
    (PASSED if ok else FAILED).append(name)
    print(f"[{'OK ' if ok else 'FALLA'}] {name}: obtenido = {got!r}, esperado ≈ {expected}")


def expect_error(name, fn, *args, **kw):
    try:
        fn(*args, **kw)
    except ValueError as e:
        PASSED.append(name)
        print(f"[OK ] {name}: avisa -> {e}")
        return
    FAILED.append(name)
    print(f"[FALLA] {name}: no lanzó el aviso esperado")


def main():
    f = "x^3 - x - 2"
    root = 1.5213797068

    # --- Raíces ---
    r = nm.solve_bisection(f, 1, 2, stop_mode="cifras", sig_figs=6)
    check("Bisección", r["root"], root, 1e-5)
    check("Bisección: ea final < es", float(r["final_error"] < r["es"]), 1, 0)
    r = nm.solve_false_position(f, 1, 2, stop_mode="cifras", sig_figs=6)
    check("Falsa Posición", r["root"], root, 1e-5)
    r = nm.solve_newton_raphson(f, 1.5, stop_mode="cifras", sig_figs=8)
    check("Newton-Raphson", r["root"], root, 1e-7)
    r = nm.solve_secant(f, 1, 2, stop_mode="cifras", sig_figs=8)
    check("Secante", r["root"], root, 1e-7)
    r = nm.solve_bisection(f, 1, 2, stop_mode="iteraciones", max_iter=10)
    check("Bisección: modo 10 iteraciones", len(r["iterations"]), 10, 0)
    expect_error("Bisección sin cambio de signo", nm.solve_bisection, f, 2, 3)
    expect_error("Falsa Posición sin cambio de signo", nm.solve_false_position, f, 2, 3)
    expect_error("Newton con f'(x0) = 0", nm.solve_newton_raphson, "x^2 - 4", 0)

    # --- Integración: ∫0^π sin(x) dx = 2, n = 6 ---
    for rule, fn, exp_val in (
        ("Trapecio", nm.solve_trapezoidal, 1.9540972333),
        ("Simpson 1/3", nm.solve_simpson_13, 2.0008631896),
        ("Simpson 3/8", nm.solve_simpson_38, 2.0020098466),
    ):
        r = fn("sin(x)", 0, math.pi, 6, exact_value=2)
        check(f"{rule} n=6", r["integral"], exp_val, 1e-8)
        errs = [row["et"] for row in r["iterations"]]
        check(f"{rule}: el error baja al subir n", float(errs[-1] < errs[0]), 1, 0)
        r = fn("sin(x)", 0, math.pi, stop_mode="cifras", sig_figs=6)
        check(f"{rule} por cifras significativas", r["integral"], 2.0, 1e-5)
    expect_error("Simpson 1/3 con n impar", nm.solve_simpson_13, "sin(x)", 0, math.pi, 5)
    expect_error("Simpson 3/8 con n no múltiplo de 3", nm.solve_simpson_38, "sin(x)", 0, math.pi, 4)

    # --- Regresión ---
    r = nm.solve_least_squares([[1, 2], [2, 4.1], [3, 5.9], [4, 8.2]], degree=1)
    check("Mínimos cuadrados: pendiente", r["slope"], 2.04, 1e-9)
    check("Mínimos cuadrados: intercepto", r["intercept"], -0.05, 1e-9)
    r2 = nm.solve_least_squares([[0, 1], [1, 2], [2, 5], [3, 10]], degree=2)
    check("Mínimos cuadrados grado 2 (x^2+1)", r2["coefficients"][0], 1.0, 1e-9)

    # --- Interpolación ---
    r = nm.solve_interpolation([[1, 1], [2, 8], [3, 27]], evaluate_x=2.5)
    a2, a1, a0 = r["coefficients"]
    check("Interpolación: a2", a2, 6, 1e-9)
    check("Interpolación: a1", a1, -11, 1e-9)
    check("Interpolación: a0", a0, 6, 1e-9)
    check("Interpolación: p(2.5)", r["evaluated_value"], 16, 1e-9)

    # --- Optimización ---
    r = nm.solve_golden_univariate("2*sin(x) - x^2/10", 0, 4, opt_type="max", sig_figs=6)
    check("Sección áurea: x", r["optimal_x"], 1.4275517, 1e-4)
    check("Sección áurea: f", r["optimal_f"], 1.7757256531, 1e-6)
    check("Sección áurea: 1 evaluación por iteración (reutiliza punto)",
          r["function_evaluations"], r["iterations_count"] + 1, 0)
    r = nm.solve_golden_univariate("(x-2)^2 + 1", 0, 5, opt_type="min", sig_figs=6)
    check("Sección áurea mínimo", r["optimal_x"], 2.0, 1e-4)
    r = nm.solve_golden_multivariate("(x - 1)^2 + (y + 2)^2", [-5, 5], [-5, 5], opt_type="min", sig_figs=6)
    check("Sección áurea multivariada: x", r["optimal_x"], 1.0, 1e-5)
    check("Sección áurea multivariada: y", r["optimal_y"], -2.0, 1e-5)
    check("Sección áurea multivariada: f", r["optimal_f"], 0.0, 1e-9)

    # --- Lectura de expresiones (requiere sympy instalado) ---
    from services import math_utils as mu
    if mu.sp is not None:
        for txt, x, val in (("2x^2 + 3x", 2.0, 14.0), ("sen(x) + cos(x)", 0.0, 1.0),
                            ("e^x", 1.0, math.e), ("ln(x)", math.e, 1.0), ("sqrt(x) + abs(-x)", 4.0, 6.0),
                            ("pi*x", 1.0, math.pi)):
            check(f"Expresión '{txt}'", mu.evaluate(mu.compile_expression(txt).func, x), val, 1e-12)
        d = mu.compile_derivative(mu.compile_expression("x^3 - x - 2"))
        check("Derivada simbólica de x^3 - x - 2 en x=2", mu.evaluate(d.func, 2.0), 11.0, 1e-12)
        g = mu.compile_expression("(x - 1)^2 + (y + 2)^2", ("x", "y"))
        check("Expresión de dos variables", mu.evaluate(g.func, 1.0, -2.0), 0.0, 1e-12)
        expect_error("Expresión incompleta 'x +'", mu.compile_expression, "x +")
        expect_error("Variable desconocida 'z'", mu.compile_expression, "z + 1")
        expect_error("Expresión con '='", mu.compile_expression, "x = 2")
    else:
        print("(sympy no está instalado: se omiten las pruebas de lectura de expresiones)")

    print(f"\n{len(PASSED)} pruebas correctas, {len(FAILED)} fallidas.")
    if FAILED:
        print("Fallidas:", ", ".join(FAILED))
        sys.exit(1)


if __name__ == "__main__":
    main()
