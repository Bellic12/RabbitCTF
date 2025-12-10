import pytest
import sys
import os

# Add parent directory to path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal
from app.models.event_config import EventConfig
from app.core.enum import EventStatus

def calculate_status(start_time, end_time):
    """
    Simula la lógica exacta que usa el backend/frontend
    para determinar el estado.
    """
    now = datetime.now(timezone.utc)
    
    # Asegurar que las fechas sean timezone-aware para la comparación
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)

    if now < start_time:
        return EventStatus.NOT_STARTED
    elif start_time <= now <= end_time:
        return EventStatus.ACTIVE
    else:
        return EventStatus.FINISHED

def test_event_status_transitions():
    print("\n" + "="*60)
    print(" TEST: EVENT STATUS LIFECYCLE (Time Travel Simulation)")
    print("="*60)

    db = SessionLocal()
    try:
        # 1. Obtener configuración actual
        config = db.query(EventConfig).first()
        if not config:
            pytest.fail("No event configuration found in DB")

        # Guardar estado original para restaurarlo al final
        original_start = config.start_time
        original_end = config.end_time
        
        now = datetime.now(timezone.utc)
        print(f" Current Time (UTC): {now}")

        # ---------------------------------------------------------
        # ESCENARIO 1: El evento es en el FUTURO
        # ---------------------------------------------------------
        print("\n[1] Testing FUTURE event (Should be NOT_STARTED)...")
        config.start_time = now + timedelta(hours=1) # Empieza en 1 hora
        config.end_time = now + timedelta(hours=2)   # Termina en 2 horas
        db.commit()
        
        status = calculate_status(config.start_time, config.end_time)
        print(f"    Start: {config.start_time} | End: {config.end_time}")
        print(f"    Result Status: {status}")
        assert status == EventStatus.NOT_STARTED
        print("     PASS")

        # ---------------------------------------------------------
        # ESCENARIO 2: El evento es AHORA (En curso)
        # ---------------------------------------------------------
        print("\n[2] Testing ONGOING event (Should be ACTIVE)...")
        config.start_time = now - timedelta(minutes=30) # Empezó hace 30 min
        config.end_time = now + timedelta(minutes=30)   # Termina en 30 min
        db.commit()

        status = calculate_status(config.start_time, config.end_time)
        print(f"    Start: {config.start_time} | End: {config.end_time}")
        print(f"    Result Status: {status}")
        assert status == EventStatus.ACTIVE
        print("     PASS")

        # ---------------------------------------------------------
        # ESCENARIO 3: El evento es PASADO
        # ---------------------------------------------------------
        print("\n[3] Testing PAST event (Should be FINISHED)...")
        config.start_time = now - timedelta(hours=2) # Empezó hace 2 horas
        config.end_time = now - timedelta(hours=1)   # Terminó hace 1 hora
        db.commit()

        status = calculate_status(config.start_time, config.end_time)
        print(f"    Start: {config.start_time} | End: {config.end_time}")
        print(f"    Result Status: {status}")
        assert status == EventStatus.FINISHED
        print("     PASS")

    finally:
        # Restaurar configuración original
        print("\n Restoring original database configuration...")
        config.start_time = original_start
        config.end_time = original_end
        db.commit()
        db.close()
        print("="*60 + "\n")