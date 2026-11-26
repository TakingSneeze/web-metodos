from fastapi import HTTPException


def run_method(fn, method_name: str, **kwargs):
    """Ejecuta un método y convierte los errores en respuestas HTTP con mensajes claros."""
    try:
        return fn(**kwargs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail=f"División por cero durante {method_name}. Revisa los datos de entrada.")
    except OverflowError:
        raise HTTPException(status_code=400, detail=f"Desbordamiento numérico en {method_name}: los valores crecen demasiado.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno en {method_name}: {e}")
