#!/usr/bin/env python
"""
VOLTA Validation Runner
Execute all tests and generate validation report
"""

import sys
import json
from datetime import datetime
from backend.app.services.calculations import (
    StressEngine,
    RecoveryCalculator,
    MenstrualPeriodizationEngine,
    MovementData,
    WorkoutType,
    AcwrZone,
    RecoveryStatus,
)


class ValidationReport:
    """Generate detailed validation report"""

    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0

    def add_test(self, test_name: str, expected: any, actual: any, passed: bool):
        """Add test result to report"""
        status = "[PASS] PASS" if passed else "[FAIL] FAIL"
        self.results.append({
            "test": test_name,
            "expected": expected,
            "actual": actual,
            "status": status,
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1

    def print_report(self):
        """Print formatted report"""
        print("\n" + "=" * 80)
        print("VOLTA VALIDATION REPORT")
        print(f"Generated: {datetime.now().isoformat()}")
        print("=" * 80 + "\n")

        for result in self.results:
            print(result['status'] + " " + result['test'])
            print("   Expected: " + str(result['expected']))
            print("   Actual:   " + str(result['actual']) + "\n")

        print("=" * 80)
        print(f"SUMMARY: {self.passed} passed, {self.failed} failed")
        print(f"Success Rate: {self.passed/(self.passed+self.failed)*100:.1f}%")
        print("=" * 80 + "\n")


def test_fran_calculation():
    """Test Fran IMR calculation"""
    print("Testing: Fran (21-15-9 Thrusters @ 95lbs + Pull-ups)")

    movements = [
        MovementData(
            movement_id="thruster",
            stress_coefficient=1.05,
            reps=45,
            weight_kg=43.1,
        ),
        MovementData(
            movement_id="pullup",
            stress_coefficient=1.0,
            reps=45,
            bodyweight=80,
        ),
    ]

    result = StressEngine.calculate_imr(
        movements=movements,
        workout_type=WorkoutType.FOR_TIME,
        time_minutes=7.6,
        total_reps=90,
    )

    print(f"  Thrusters IMR: {result['movements'][0]['stress']}")
    print(f"  Pull-ups IMR:  {result['movements'][1]['stress']}")
    print(f"  Subtotal:      {result['subtotal']}")
    print(f"  Density:       {result['density_factor']}x")
    print(f"  Type Multiplier: {result['workout_multiplier']}x")
    print(f"  FINAL IMR:     {result['final_imr']}")
    print(f"  Expected:      ~5,920\n")

    report = ValidationReport()
    report.add_test(
        "Fran IMR",
        "5,800-6,000",
        result["final_imr"],
        5800 < result["final_imr"] < 6000
    )
    return report


def test_amrap_high_stress():
    """Test AMRAP high stress calculation"""
    print("Testing: Push Capacity (AMRAP 10': HSPUs, PUs, Wall Balls)")

    movements = [
        MovementData(
            movement_id="hspu",
            stress_coefficient=1.15,
            reps=38,
            bodyweight=80,
        ),
        MovementData(
            movement_id="pushup",
            stress_coefficient=0.90,
            reps=70,
            bodyweight=80,
        ),
        MovementData(
            movement_id="wall_ball",
            stress_coefficient=0.80,
            reps=105,
            weight_kg=9,
        ),
    ]

    result = StressEngine.calculate_imr(
        movements=movements,
        workout_type=WorkoutType.AMRAP,
        time_minutes=10,
        total_reps=213,
    )

    print(f"  HSPUs IMR:     {result['movements'][0]['stress']}")
    print(f"  Push-ups IMR:  {result['movements'][1]['stress']}")
    print(f"  Wall Balls IMR: {result['movements'][2]['stress']}")
    print(f"  Subtotal:      {result['subtotal']}")
    print(f"  Density:       {result['density_factor']}x (Very fast: {result['reps_per_minute']} reps/min)")
    print(f"  Type Multiplier: {result['workout_multiplier']}x (AMRAP)")
    print(f"  FINAL IMR:     {result['final_imr']}")
    print(f"  Expected:      >11,000 (Highest stress)\n")

    report = ValidationReport()
    report.add_test(
        "AMRAP High Stress",
        ">11,000",
        result["final_imr"],
        result["final_imr"] > 11000
    )
    return report


def test_recovery_scores():
    """Test recovery score calculations"""
    print("Testing: Recovery Score Calculations")

    test_cases = [
        ("Good Recovery (8h, stress 2, pain 1)", 8.0, 2, 1, 0.65),
        ("Fair Recovery (7h, stress 3, pain 3)", 7.0, 3, 3, 0.50),
        ("Poor Recovery (5.5h, stress 4, pain 4)", 5.5, 4, 4, 0.50),
    ]

    report = ValidationReport()

    for name, sleep, stress, pain, threshold in test_cases:
        score, status = RecoveryCalculator.calculate_recovery_score(
            sleep_hours=sleep,
            stress_level=stress,
            pain_level=pain,
        )

        print(f"  {name}: {score}")

        if "Good" in name:
            report.add_test(f"Recovery {name}", f">0.65", score, score > 0.65)
        elif "Fair" in name:
            report.add_test(f"Recovery {name}", "0.5-0.65", score, 0.5 <= score <= 0.65)
        else:
            report.add_test(f"Recovery {name}", "<0.5", score, score < 0.5)

    print()
    return report


def test_acwr_zones():
    """Test ACWR zone calculations"""
    print("Testing: ACWR Zone Calculations")

    test_cases = [
        ("Optimal", 25000, 21500, AcwrZone.OPTIMAL, 1.0),
        ("Caution", 30000, 21500, AcwrZone.CAUTION, 2.0),
        ("Danger", 35000, 21500, AcwrZone.DANGER, 4.0),
        ("Undertrain", 15000, 21500, AcwrZone.UNDERTRAIN, 1.5),
    ]

    report = ValidationReport()

    for name, acute, chronic, expected_zone, expected_risk in test_cases:
        result = StressEngine.calculate_acwr(
            acute_workload=acute,
            chronic_workload=chronic,
        )

        print(f"  {name}: ACWR {result.acwr} -> {result.zone.value} (Risk: {result.injury_risk_multiplier}x)")

        report.add_test(
            f"ACWR {name} - Zone",
            expected_zone.value,
            result.zone.value,
            result.zone == expected_zone
        )
        report.add_test(
            f"ACWR {name} - Risk",
            expected_risk,
            result.injury_risk_multiplier,
            result.injury_risk_multiplier == expected_risk
        )

    print()
    return report


def test_menstrual_periodization():
    """Test menstrual cycle adjustments"""
    print("Testing: Menstrual Periodization")

    from datetime import datetime

    test_cases = [
        ("Menstrual (Day 3)", datetime(2026, 3, 1), datetime(2026, 3, 3), "menstrual", 0.80),
        ("Follicular (Day 10)", datetime(2026, 3, 1), datetime(2026, 3, 10), "follicular", 1.15),
        ("Ovulation (Day 16)", datetime(2026, 3, 1), datetime(2026, 3, 16), "ovulation", 1.10),
        ("Luteal (Day 25)", datetime(2026, 3, 1), datetime(2026, 3, 25), "luteal", 0.95),
    ]

    report = ValidationReport()

    for name, last_menses, current, expected_phase, expected_mult in test_cases:
        result = MenstrualPeriodizationEngine.get_cycle_phase(
            last_menstruation=last_menses,
            current_date=current,
        )

        print(f"  {name}: {result['phase']} (Multiplier: {result['intensity_multiplier']}x)")

        report.add_test(
            f"Menstrual {name} - Phase",
            expected_phase,
            result["phase"],
            result["phase"] == expected_phase
        )
        report.add_test(
            f"Menstrual {name} - Multiplier",
            expected_mult,
            result["intensity_multiplier"],
            result["intensity_multiplier"] == expected_mult
        )

    print()
    return report


def main():
    """Run all validation tests"""
    print("\n" + "=" * 80)
    print("VOLTA SYSTEM VALIDATION")
    print("Testing: Stress Engine, ACWR, Recovery, Menstrual Periodization")
    print("=" * 80 + "\n")

    all_reports = []

    # Run tests
    all_reports.append(test_fran_calculation())
    all_reports.append(test_amrap_high_stress())
    all_reports.append(test_recovery_scores())
    all_reports.append(test_acwr_zones())
    all_reports.append(test_menstrual_periodization())

    # Aggregate results
    total_passed = sum(r.passed for r in all_reports)
    total_failed = sum(r.failed for r in all_reports)

    print("\n" + "=" * 80)
    print("FINAL VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {total_passed + total_failed}")
    print(f"[PASS] Passed: {total_passed}")
    print(f"[FAIL] Failed: {total_failed}")

    if total_failed == 0:
        print("\n[SUCCESS] ALL TESTS PASSED! System is ready for integration.")
        return 0
    else:
        print(f"\n[WARNING]  {total_failed} tests failed. Review calculations before deployment.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
