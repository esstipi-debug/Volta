/**
 * MOVEMENT ESCALATION & SCALING ENGINE
 * Per Section 5: CrossFit injury epidemiology with 3-level biomechanical modifications
 * Recommends movement substitutions and progressions based on injury status/load
 */

export interface MovementModification {
  original_movement: string;
  rx_level: 'Rx+' | 'Rx' | 'Beginner';
  description: string;
  rationale: string;
  biomechanical_reason: string;
}

export interface EscalationRecommendation {
  athlete_id: string;
  current_severity: 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';
  rtp_step?: number;
  recommended_modifications: MovementModification[];
  affected_movements: string[];
  progression_criteria: string[];
  regression_triggers: string[];
}

// ============================================================
// MOVEMENT LIBRARY WITH 3-LEVEL ESCALATIONS
// Based on CrossFit injury epidemiology (Section 5)
// ============================================================

export const CROSSFIT_MOVEMENTS: Record<
  string,
  {
    rxplus: MovementModification;
    rx: MovementModification;
    beginner: MovementModification;
  }
> = {
  // ========================================
  // BARBELL MOVEMENTS
  // ========================================
  back_squat: {
    rxplus: {
      original_movement: "Back Squat",
      rx_level: "Rx+",
      description: "Back squat 90%+ 1RM, full depth ATG",
      rationale: "Max strength development",
      biomechanical_reason:
        "Requires high knee mobility, core stability, hip integrity",
    },
    rx: {
      original_movement: "Back Squat",
      rx_level: "Rx",
      description: "Back squat 70-89% 1RM, parallel depth minimum",
      rationale: "Standard strength work with reduced load",
      biomechanical_reason:
        "Reduces shear forces on knee; parallel depth safer than ATG",
    },
    beginner: {
      original_movement: "Back Squat",
      rx_level: "Beginner",
      description: "Goblet squat 20-30 lbs, or air squat with 2-inch box",
      rationale: "Minimal joint stress, mobility-friendly",
      biomechanical_reason:
        "Anterior load reduces knee stress; box eliminates depth control requirement",
    },
  },

  front_squat: {
    rxplus: {
      original_movement: "Front Squat",
      rx_level: "Rx+",
      description: "Front squat 90%+ 1RM, full depth ATG",
      rationale: "Max strength + upright torso",
      biomechanical_reason: "Requires excellent wrist/shoulder mobility",
    },
    rx: {
      original_movement: "Front Squat",
      rx_level: "Rx",
      description: "Front squat 70-89% 1RM, parallel depth",
      rationale: "Reduced load, reduced mobility demand",
      biomechanical_reason:
        "Parallel depth safer; less anterior shear on knee",
    },
    beginner: {
      original_movement: "Front Squat",
      rx_level: "Beginner",
      description:
        "Kettlebell goblet squat, or dumbbell front squat (light weight)",
      rationale: "Eliminates shoulder/wrist mobility requirement",
      biomechanical_reason:
        "Neutral grip safer for joints; light weight reduces joint load",
    },
  },

  deadlift: {
    rxplus: {
      original_movement: "Deadlift",
      rx_level: "Rx+",
      description: "Deadlift 90%+ 1RM, conventional stance",
      rationale: "Max strength, posterior chain emphasis",
      biomechanical_reason:
        "High lumbar/thoracic demand; requires excellent core stability",
    },
    rx: {
      original_movement: "Deadlift",
      rx_level: "Rx",
      description: "Deadlift 70-89% 1RM, sumo stance (wider grip)",
      rationale: "Reduced lumbar shear, hip-friendly",
      biomechanical_reason:
        "Sumo reduces knee valgus stress; wider stance more stable",
    },
    beginner: {
      original_movement: "Deadlift",
      rx_level: "Beginner",
      description: "Trap bar deadlift light weight, or RDL with dumbbells",
      rationale: "Reduced back demand, more vertical torso",
      biomechanical_reason:
        "Trap bar is more knee-friendly; RDL eliminates floor start stress",
    },
  },

  power_clean: {
    rxplus: {
      original_movement: "Power Clean",
      rx_level: "Rx+",
      description: "Power clean 90%+ 1RM, explosive pull",
      rationale: "Max power development",
      biomechanical_reason:
        "Requires explosive hip extension + ankle stability + shoulder mobility",
    },
    rx: {
      original_movement: "Power Clean",
      rx_level: "Rx",
      description: "Hang power clean 70-89% 1RM, from knee",
      rationale: "Reduced ground contact demands",
      biomechanical_reason: "Starting from hang eliminates floor instability",
    },
    beginner: {
      original_movement: "Power Clean",
      rx_level: "Beginner",
      description: "Dumbbell or kettlebell hang clean, or power shrug",
      rationale: "Eliminates explosive requirement",
      biomechanical_reason:
        "Dumbbells allow neutral grip; shrug reduces technical demand",
    },
  },

  snatch: {
    rxplus: {
      original_movement: "Snatch",
      rx_level: "Rx+",
      description: "Snatch 90%+ 1RM, full depth overhead squat",
      rationale: "Max Olympic lift performance",
      biomechanical_reason:
        "Extreme mobility demand (ankle, hip, shoulder, thoracic)",
    },
    rx: {
      original_movement: "Snatch",
      rx_level: "Rx",
      description: "Power snatch 70-89% 1RM, power position",
      rationale: "Reduced mobility, simpler mechanics",
      biomechanical_reason:
        "Landing above parallel reduces ankle/knee mobility demand",
    },
    beginner: {
      original_movement: "Snatch",
      rx_level: "Beginner",
      description: "Dumbbell snatch (light), or kettlebell swing",
      rationale: "Eliminates technical complexity",
      biomechanical_reason:
        "Dumbbells allow natural arm path; kettlebell is explosive-friendly",
    },
  },

  // ========================================
  // PRESSING MOVEMENTS
  // ========================================
  bench_press: {
    rxplus: {
      original_movement: "Bench Press",
      rx_level: "Rx+",
      description: "Bench press 90%+ 1RM, full range of motion",
      rationale: "Max upper body strength",
      biomechanical_reason:
        "Requires shoulder stability + core rigidity (arching technique)",
    },
    rx: {
      original_movement: "Bench Press",
      rx_level: "Rx",
      description: "Bench press 70-89% 1RM, or incline bench (reduced load)",
      rationale: "Reduced shoulder strain",
      biomechanical_reason:
        "Incline reduces anterior shoulder stress; lighter load safer",
    },
    beginner: {
      original_movement: "Bench Press",
      rx_level: "Beginner",
      description:
        "Dumbbell bench press (neutral grip), or machine chest press",
      rationale: "Safer shoulder position, machine-guided",
      biomechanical_reason:
        "Neutral grip reduces internal rotation demand; machine provides stability",
    },
  },

  strict_press: {
    rxplus: {
      original_movement: "Strict Press",
      rx_level: "Rx+",
      description: "Strict press 90%+ 1RM, standing, full range",
      rationale: "Max pressing strength + core demand",
      biomechanical_reason:
        "Full core anti-extension engagement; shoulder stability critical",
    },
    rx: {
      original_movement: "Strict Press",
      rx_level: "Rx",
      description: "Strict press 70-89% 1RM, or seated press (reduced core)",
      rationale: "Reduced core demand",
      biomechanical_reason:
        "Seated press removes anti-extension requirement; safer for low-back",
    },
    beginner: {
      original_movement: "Strict Press",
      rx_level: "Beginner",
      description:
        "Dumbbell press (neutral grip), or machine overhead press, light weight",
      rationale: "Eliminates barbell instability",
      biomechanical_reason:
        "Dumbbells with neutral grip reduce rotational demand",
    },
  },

  push_press: {
    rxplus: {
      original_movement: "Push Press",
      rx_level: "Rx+",
      description: "Push press 90%+ 1RM, explosive drive",
      rationale: "Max power overhead",
      biomechanical_reason:
        "Requires powerful hip/knee extension + shoulder stability",
    },
    rx: {
      original_movement: "Push Press",
      rx_level: "Rx",
      description: "Dumbbell push press 70-89% load, light explosiveness",
      rationale: "Reduced technical demand",
      biomechanical_reason: "Dumbbells allow natural arm paths",
    },
    beginner: {
      original_movement: "Push Press",
      rx_level: "Beginner",
      description: "Shoulder press (strict), or machine shoulder press",
      rationale: "Eliminates explosive demand",
      biomechanical_reason:
        "Strict press safer; machine removes instability factor",
    },
  },

  // ========================================
  // GYMNASTICS MOVEMENTS
  // ========================================
  pullup: {
    rxplus: {
      original_movement: "Pull-up",
      rx_level: "Rx+",
      description: "Unassisted pull-up, strict form, 90%+ max reps",
      rationale: "Max upper body pulling strength",
      biomechanical_reason:
        "Full bodyweight load + shoulder stability requirement",
    },
    rx: {
      original_movement: "Pull-up",
      rx_level: "Rx",
      description: "Assisted pull-up with band, or 5-10 lbs assistance",
      rationale: "Reduced load, same movement pattern",
      biomechanical_reason:
        "Band assistance reduces shoulder stress while maintaining mechanics",
    },
    beginner: {
      original_movement: "Pull-up",
      rx_level: "Beginner",
      description: "Lat pulldown machine, or light band pull-down",
      rationale: "Eliminates bodyweight load",
      biomechanical_reason:
        "Machine provides guided path; band allows easy load adjustment",
    },
  },

  muscle_up: {
    rxplus: {
      original_movement: "Muscle-up",
      rx_level: "Rx+",
      description: "Unassisted muscle-up, strict rings",
      rationale: "Max pulling + pressing power combined",
      biomechanical_reason:
        "Explosive transition + shoulder mobility + pressing strength",
    },
    rx: {
      original_movement: "Muscle-up",
      rx_level: "Rx",
      description: "Band-assisted muscle-up, or bar muscle-up (transition band)",
      rationale: "Reduced load during transition",
      biomechanical_reason:
        "Band cushions hardest part (transition); safer shoulder mechanics",
    },
    beginner: {
      original_movement: "Muscle-up",
      rx_level: "Beginner",
      description: "Pull-up + dip combo, or chest-to-bar pull-up",
      rationale: "Separates components, eliminates transition demand",
      biomechanical_reason:
        "Two separate movements safer than explosive transition",
    },
  },

  handstand_pushup: {
    rxplus: {
      original_movement: "Handstand Push-up",
      rx_level: "Rx+",
      description: "Strict HSPU, full range of motion, no support",
      rationale: "Max overhead pressing strength + balance",
      biomechanical_reason:
        "Extreme shoulder/wrist mobility + core stability requirement",
    },
    rx: {
      original_movement: "Handstand Push-up",
      rx_level: "Rx",
      description: "HSPU with feet elevated on box (reduced range)",
      rationale: "Reduces depth requirement",
      biomechanical_reason:
        "Elevated feet reduce range; safer shoulder angles",
    },
    beginner: {
      original_movement: "Handstand Push-up",
      rx_level: "Beginner",
      description: "Pike push-up, or dumbbell shoulder press",
      rationale: "Ground-based, eliminates balance demand",
      biomechanical_reason:
        "Pike push-up maintains vertical load; easier to learn",
    },
  },

  // ========================================
  // RUNNING/METABOLIC MOVEMENTS
  // ========================================
  running: {
    rxplus: {
      original_movement: "Running",
      rx_level: "Rx+",
      description: "Distance running 400m+, or fast sprint work",
      rationale: "Max cardiovascular stress",
      biomechanical_reason:
        "High impact; knee/ankle/hip stress maximized",
    },
    rx: {
      original_movement: "Running",
      rx_level: "Rx",
      description: "Moderate running 200-400m, or rowing equivalent",
      rationale: "Reduced distance, same metabolic demand",
      biomechanical_reason:
        "Shorter distances reduce cumulative impact stress",
    },
    beginner: {
      original_movement: "Running",
      rx_level: "Beginner",
      description: "Bike or ski erg, or rowing machine (low impact)",
      rationale: "Eliminates impact stress",
      biomechanical_reason:
        "Machines remove ground reaction forces; knee-safe alternatives",
    },
  },

  box_jump: {
    rxplus: {
      original_movement: "Box Jump",
      rx_level: "Rx+",
      description: "Box jump 30+ inches, explosive max height",
      rationale: "Max power development",
      biomechanical_reason:
        "Highest landing impact; requires ankle/knee stability",
    },
    rx: {
      original_movement: "Box Jump",
      rx_level: "Rx",
      description: "Box jump 20-24 inches, or step-down instead of jump down",
      rationale: "Reduced height, reduced impact",
      biomechanical_reason:
        "Lower box reduces landing forces; stepping down safer",
    },
    beginner: {
      original_movement: "Box Jump",
      rx_level: "Beginner",
      description: "Box step-up with countermovement, no jump",
      rationale: "Eliminates impact entirely",
      biomechanical_reason:
        "Countermovement allows controlled load; no landing shock",
    },
  },
};

// ============================================================
// ESCALATION ENGINE
// ============================================================
export class MovementEscalationEngine {
  getEscalationByAlert(
    athlete_id: string,
    severity: 'GREEN' | 'YELLOW' | 'RED' | 'BLACK',
    current_movements: string[]
  ): EscalationRecommendation {
    const recommendations: EscalationRecommendation = {
      athlete_id,
      current_severity: severity,
      recommended_modifications: [],
      affected_movements: [],
      progression_criteria: [],
      regression_triggers: [],
    };

    switch (severity) {
      case 'GREEN':
        recommendations.progression_criteria = [
          "Athlete reports wellbeing ≥8/10",
          "ACWR <0.60",
          "HRV within baseline ±10%",
          "Sleep ≥7 hours",
        ];
        recommendations.recommended_modifications = []; // No changes
        break;

      case 'YELLOW':
        recommendations.recommended_modifications = current_movements
          .map((mov) => this.downscaleMovement(mov, 'Rx'))
          .filter((m) => m !== null) as MovementModification[];
        recommendations.affected_movements = current_movements;
        recommendations.progression_criteria = [
          "ACWR <0.60 for 5+ consecutive days",
          "HRV stable ±10% for 5+ days",
          "Subjective wellbeing ≥7/10 sustained",
          "Sleep ≥7.5 hours average",
        ];
        recommendations.regression_triggers = [
          "HRV drops >20% from baseline",
          "Sleep <7 hours sustained",
          "ACWR increases above 0.75",
        ];
        break;

      case 'RED':
        recommendations.rtp_step = 3; // Sport-specific training (ACWR <0.60)
        recommendations.recommended_modifications = current_movements
          .map((mov) => this.downscaleMovement(mov, 'Beginner'))
          .filter((m) => m !== null) as MovementModification[];
        recommendations.affected_movements = current_movements;
        recommendations.progression_criteria = [
          "3-5 days at current level with no regression",
          "ACWR <0.60 maintained",
          "No pain/symptom return",
          "HRV depressed <15%",
          "Subjective wellbeing ≥6/10",
        ];
        recommendations.regression_triggers = [
          "Pain returns",
          "ACWR exceeds 0.70",
          "HRV depression >30%",
          "Symptoms worsen",
        ];
        break;

      case 'BLACK':
        recommendations.rtp_step = 1; // Complete rest
        recommendations.recommended_modifications = [
          {
            original_movement: "ALL MOVEMENTS",
            rx_level: "Beginner",
            description:
              "Complete rest or light mobility work only (walking, stretching)",
            rationale:
              "Emergency state - training cessation required",
            biomechanical_reason:
              "Maximum joint unloading; allow tissue recovery",
          },
        ];
        recommendations.affected_movements = current_movements;
        recommendations.regression_triggers = [
          "In emergency state - continue complete rest",
          "Medical clearance required before progression",
          "Monitor T/C ratio if available",
        ];
        break;
    }

    return recommendations;
  }

  private downscaleMovement(
    movement: string,
    target_level: 'Rx' | 'Beginner'
  ): MovementModification | null {
    const normalized = movement.toLowerCase().replace(/[\s-]/g, "_");

    for (const [key, variants] of Object.entries(CROSSFIT_MOVEMENTS)) {
      if (
        key === normalized ||
        normalized.includes(key) ||
        key.includes(normalized)
      ) {
        return target_level === 'Rx' ? variants.rx : variants.beginner;
      }
    }

    // If not found, return generic downscale recommendation
    return {
      original_movement: movement,
      rx_level: target_level,
      description: `Scale ${movement} to ${target_level} level`,
      rationale: "Reduce load and complexity per alert status",
      biomechanical_reason:
        "Lower biomechanical demand; safer joint angles",
    };
  }

  getRTPProgression(current_step: number): EscalationRecommendation {
    const rtp_steps = [
      { step: 1, name: "Complete Rest", movements: "None" },
      { step: 2, name: "Light Activity", movements: "Walking, stretching" },
      {
        step: 3,
        name: "Sport-Specific",
        movements: "Technique drills, no intensity",
      },
      {
        step: 4,
        name: "Moderate Intensity",
        movements: "60-70% effort drills",
      },
      {
        step: 5,
        name: "High Intensity",
        movements: "80-90% effort, match WOD intensity",
      },
      { step: 6, name: "Full Return", movements: "Normal training" },
    ];

    const current = rtp_steps.find((s) => s.step === current_step);

    return {
      athlete_id: "",
      current_severity: "RED",
      rtp_step: current_step,
      recommended_modifications: [],
      affected_movements: [current?.movements || ""],
      progression_criteria: [
        "No pain/symptoms",
        "Subjective wellbeing ≥7/10",
        "Sleep ≥7 hours",
        "HRV stable",
      ],
      regression_triggers: [
        "Pain returns",
        "Fatigue increases",
        "HRV drops significantly",
      ],
    };
  }
}
