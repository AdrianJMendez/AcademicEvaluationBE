import { DiscrepancyProp, ParsedSubject, PrimarySubject } from "./interfaces/careerInterfaces";

/**
 * Normalize years so that the minimum year in history becomes year 1.
 * Returns a mapping from original year to normalized year.
 */
function normalizeYears(history: ParsedSubject[]): Map<number, number> {
    if (history.length === 0) return new Map();
    
    let minYear = Infinity;
    for (const entry of history) {
        minYear = Math.min(minYear, entry.year);
    }
    
    const yearMap = new Map<number, number>();
    for (const entry of history) {
        if (!yearMap.has(entry.year)) {
            yearMap.set(entry.year, entry.year - minYear + 1);
        }
    }
    return yearMap;
}

/**
 * Converts a normalized year and period to an absolute period number (1-indexed).
 */
function toAbsolutePeriod(year: number, period: number): number {
    return (year - 1) * 3 + period;
}

/**
 * Converts absolute period to year and period number.
 */
function toYearAndPeriod(absPeriod: number): { year: number; period: number } {
    const year = Math.floor((absPeriod - 1) / 3) + 1;
    const period = ((absPeriod - 1) % 3) + 1;
    return { year, period };
}

/**
 * Gets the normalized current period from history (latest occurrence).
 */
function getCurrentNormalizedPeriod(history: ParsedSubject[], yearMap: Map<number, number>): number {
    if (history.length === 0) return 0;
    
    let latestEntry = history[0];
    for (const entry of history) {
        const entryYear = yearMap.get(entry.year) || 0;
        const latestYear = yearMap.get(latestEntry.year) || 0;
        if (entryYear > latestYear || (entryYear === latestYear && entry.period > latestEntry.period)) {
            latestEntry = entry;
        }
    }
    
    const normYear = yearMap.get(latestEntry.year) || 1;
    return toAbsolutePeriod(normYear, latestEntry.period);
}

/**
 * Checks whether the student has already completed the entire curriculum.
 */
function isCurriculumCompleted(
    subjectsMap: Map<string, PrimarySubject>,
    completedSubjects: Set<string>,
    completedOptativesCount: number,
    completedElectivesCount: number
): boolean {
    for (const subject of subjectsMap.values()) {
        if (!subject.isOptative && !subject.isElective) {
            if (!completedSubjects.has(subject.subjectCode)) {
                return false;
            }
        }
    }
    return completedOptativesCount >= 3 && completedElectivesCount >= 3;
}

/**
 * Feasibility check: can the student finish all remaining subjects by period 15.
 */
function canCompleteOnTime(
    subjectsMap: Map<string, PrimarySubject>,
    completedSubjects: Set<string>,
    completedOptativesCount: number,
    completedElectivesCount: number,
    currentAbsolutePeriod: number
): boolean {
    const pendingSubjects: PrimarySubject[] = [];
    let neededOptatives = Math.max(0, 3 - completedOptativesCount);
    let neededElectives = Math.max(0, 3 - completedElectivesCount);

    for (const subject of subjectsMap.values()) {
        if (completedSubjects.has(subject.subjectCode)) continue;
        
        if (!subject.isOptative && !subject.isElective) {
            pendingSubjects.push(subject);
        } else if (subject.isOptative && neededOptatives > 0) {
            pendingSubjects.push(subject);
            neededOptatives--;
        } else if (subject.isElective && neededElectives > 0) {
            pendingSubjects.push(subject);
            neededElectives--;
        }
    }

    if (pendingSubjects.length === 0) return true;

    const prereqMap = new Map<string, Set<string>>();
    for (const subj of subjectsMap.values()) {
        if (subj.prerequisites) {
            const prereqSet = new Set<string>();
            for (const p of subj.prerequisites) {
                prereqSet.add(p.subjectCode);
            }
            prereqMap.set(subj.subjectCode, prereqSet);
        } else {
            prereqMap.set(subj.subjectCode, new Set());
        }
    }

    function prerequisitesSatisfied(subjectCode: string, scheduled: Set<string>): boolean {
        const prereqs = prereqMap.get(subjectCode) || new Set();
        for (const prereq of prereqs) {
            if (!completedSubjects.has(prereq) && !scheduled.has(prereq)) {
                return false;
            }
        }
        return true;
    }

    let scheduled = new Set<string>();
    let remaining = [...pendingSubjects];
    let period = currentAbsolutePeriod + 1;
    const MAX_PERIOD = 15;

    while (remaining.length > 0 && period <= MAX_PERIOD) {
        const canTake: PrimarySubject[] = [];
        for (const subj of remaining) {
            if (prerequisitesSatisfied(subj.subjectCode, scheduled)) {
                canTake.push(subj);
            }
        }
        canTake.sort((a, b) => a.idealPeriod - b.idealPeriod);
        
        const toTake = canTake.slice(0, 5);
        if (toTake.length === 0) return false;
        
        for (const subj of toTake) {
            scheduled.add(subj.subjectCode);
            const idx = remaining.findIndex(s => s.subjectCode === subj.subjectCode);
            if (idx !== -1) remaining.splice(idx, 1);
        }
        period++;
    }

    return remaining.length === 0 && period - 1 <= MAX_PERIOD;
}

/**
 * Verifica si existen asignaturas cursadas sin tener sus requisitos completados.
 * Retorna una discrepancia si encuentra alguna violación de prerequisitos.
 */
function checkMissingPrerequisites(
    history: ParsedSubject[],
    primarySubjects: PrimarySubject[],
    lastCompletionPeriod: Map<string, number>
): DiscrepancyProp | null {
    const subjectsMap = new Map<string, PrimarySubject>();
    for (const subj of primarySubjects) {
        subjectsMap.set(subj.subjectCode, subj);
    }
    
    const violations: string[] = [];
    
    for (const historyEntry of history) {
        const subject = subjectsMap.get(historyEntry.subjectCode);
        if (!subject) continue;
        
        // Check if subject has prerequisites
        if (subject.prerequisites && subject.prerequisites.length > 0) {
            for (const prereq of subject.prerequisites) {
                // Check if prerequisite was completed BEFORE this subject was taken
                const prereqCompletionPeriod = lastCompletionPeriod.get(prereq.subjectCode);
                const currentSubjectPeriod = lastCompletionPeriod.get(historyEntry.subjectCode);

                console.log(prereqCompletionPeriod, currentSubjectPeriod);
                
                if (!prereqCompletionPeriod) {
                    // Prerequisite never completed
                    violations.push(`"${subject.subjectName}" requiere "${prereq.subjectName}" que nunca fue cursada`);
                } else if (currentSubjectPeriod && prereqCompletionPeriod > currentSubjectPeriod) {
                    // Prerequisite was completed after the subject (should be impossible in valid history,
                    // but could happen if data is inconsistent)
                    violations.push(`"${subject.subjectName}" fue cursada antes que su requisito "${prereq.subjectName}"`);
                }
            }
        }
    }
    
    if (violations.length > 0) {
        const uniqueViolations = [...new Set(violations)];
        const description = `Existen asignaturas cursadas sin cumplir sus requisitos: ${uniqueViolations.join("; ")}.`;
        return {
            type: "Error",
            description,
            severity: "Alta"
        };
    }
    
    return null;
}

/**
 * Verifica si el historial tiene consistencia básica (códigos de materia válidos).
 */
function validateHistory(
    history: ParsedSubject[],
    primarySubjects: PrimarySubject[]
): DiscrepancyProp | null {
    const validCodes = new Set(primarySubjects.map(s => s.subjectCode));
    const invalidSubjects = new Set<string>();
    
    for (const entry of history) {
        if (!validCodes.has(entry.subjectCode)) {
            invalidSubjects.add(entry.subjectCode);
        }
    }
    
    if (invalidSubjects.size > 0) {
        const subjectsList = Array.from(invalidSubjects).join(", ");
        return {
            type: "Error",
            description: `El historial contiene asignaturas que no pertenecen al plan de estudios: ${subjectsList}.`,
            severity: "Alta"
        };
    }
    
    return null;
}

/**
 * Groups discrepancies by type and similar descriptions.
 */
function groupDiscrepancies(discrepancies: DiscrepancyProp[]): DiscrepancyProp[] {
    const grouped: DiscrepancyProp[] = [];
    
    // Separate different types of discrepancies
    const pendingSubjectsLate: string[] = [];
    const lowLoadPeriods: Map<number, number[]> = new Map(); // year -> periods[]
    const retrasoPrereq: string[] = [];
    const retrasoSimple: string[] = [];
    const emptyPeriods: { year: number; periods: number[] }[] = [];
    
    for (const disc of discrepancies) {
        // Group "asignatura atrasada" (pending subjects that are late)
        if (disc.description.includes("aún no ha sido cursada") && disc.type === "Retraso") {
            const match = disc.description.match(/"([^"]+)"/);
            if (match) {
                pendingSubjectsLate.push(match[1]);
            }
            continue;
        }
        
        // Group "retraso por prerequisito"
        if (disc.description.includes("debido a que su requisito") && disc.type === "Retraso") {
            retrasoPrereq.push(disc.description);
            continue;
        }
        
        // Group simple retraso (already late subjects that are not pending)
        if (disc.type === "Retraso" && !disc.description.includes("aún no ha sido cursada") && 
            !disc.description.includes("debido a que su requisito")) {
            retrasoSimple.push(disc.description);
            continue;
        }
        
        // Group low load periods (pocas asignaturas)
        if (disc.type === "Baja carga académica" && disc.description.includes("menos del mínimo recomendado")) {
            const match = disc.description.match(/año (\d+), periodo (\d+)/);
            if (match) {
                const year = parseInt(match[1]);
                const period = parseInt(match[2]);
                if (!lowLoadPeriods.has(year)) {
                    lowLoadPeriods.set(year, []);
                }
                lowLoadPeriods.get(year)!.push(period);
            }
            continue;
        }
        
        // Group empty periods
        if (disc.type === "Periodo sin matricula") {
            const match = disc.description.match(/año (\d+), periodo (\d+)/);
            if (match) {
                const year = parseInt(match[1]);
                const period = parseInt(match[2]);
                const existing = emptyPeriods.find(e => e.year === year);
                if (existing) {
                    existing.periods.push(period);
                } else {
                    emptyPeriods.push({ year, periods: [period] });
                }
            }
            continue;
        }
        
        // Keep other discrepancies as is
        grouped.push(disc);
    }
    
    // Add grouped pending subjects late
    if (pendingSubjectsLate.length > 0) {
        const sorted = pendingSubjectsLate.sort();
        const subjectsList = sorted.map(s => `"${s}"`).join(", ");
        const description = `La(s) asignatura(s): ${subjectsList} aún no han sido cursada(s) y ya se encuentran atrasada(s).`;
        grouped.push({
            type: "Retraso",
            description,
            severity: "Alta"
        });
    }
    
    // Add grouped low load periods
    for (const [year, periods] of lowLoadPeriods.entries()) {
        periods.sort((a, b) => a - b);
        const periodsStr = periods.length === 1 ? `periodo ${periods[0]}` : `periodos ${periods.join(" y ")}`;
        const description = `En el año ${year}, ${periodsStr} se matricularon menos asignaturas del mínimo recomendado (4).`;
        grouped.push({
            type: "Baja carga académica",
            description,
            severity: "Media"
        });
    }
    
    // Add grouped empty periods
    for (const empty of emptyPeriods) {
        empty.periods.sort((a, b) => a - b);
        const periodsStr = empty.periods.length === 1 ? `periodo ${empty.periods[0]}` : `periodos ${empty.periods.join(" y ")}`;
        const description = `No se matricularon asignaturas en el año ${empty.year}, ${periodsStr}.`;
        grouped.push({
            type: "Periodo sin matricula",
            description,
            severity: "Media"
        });
    }
    
    // Add retrasoPrereq as individual items (each is unique and important)
    for (const disc of retrasoPrereq) {
        grouped.push({
            type: "Retraso",
            description: disc,
            severity: "Alta"
        });
    }
    
    // Add retrasoSimple as individual items
    for (const disc of retrasoSimple) {
        grouped.push({
            type: "Retraso",
            description: disc,
            severity: "Media"
        });
    }
    
    return grouped;
}

/**
 * Main analysis function.
 */
export function analyzeCurriculum(
    primarySubjects: PrimarySubject[],
    history: ParsedSubject[]
): DiscrepancyProp[] {
    const discrepancies: DiscrepancyProp[] = [];

    const subjectsMap = new Map<string, PrimarySubject>();
    for (const subj of primarySubjects) {
        subjectsMap.set(subj.subjectCode, subj);
    }

    if (history.length === 0) {
        return [{
            type: "Observacion",
            description: "El estudiante no tiene historial académico registrado.",
            severity: "Info"
        }];
    }

    // VALIDACIÓN 1: Verificar que las asignaturas del historial existan en el plan
    const historyValidation = validateHistory(history, primarySubjects);
    if (historyValidation) {
        discrepancies.push(historyValidation);
    }

    const yearMap = normalizeYears(history);
    
    const lastCompletionPeriod = new Map<string, number>();
    const periodToSubjects = new Map<number, Set<string>>();
    let maxAbsolutePeriod = 0;

    for (const entry of history) {
        const normYear = yearMap.get(entry.year) || 1;
        const absPeriod = toAbsolutePeriod(normYear, entry.period);
        maxAbsolutePeriod = Math.max(maxAbsolutePeriod, absPeriod);

        lastCompletionPeriod.set(entry.subjectCode, absPeriod);

        if (!periodToSubjects.has(absPeriod)) {
            periodToSubjects.set(absPeriod, new Set());
        }
        periodToSubjects.get(absPeriod)!.add(entry.subjectCode);
    }

    const completedSubjects = new Set(lastCompletionPeriod.keys());
    let completedOptatives = 0;
    let completedElectives = 0;
    for (const code of completedSubjects) {
        const subj = subjectsMap.get(code);
        if (subj) {
            if (subj.isOptative) completedOptatives++;
            if (subj.isElective) completedElectives++;
        }
    }

    // VALIDACIÓN 2: Verificar prerequisitos de las asignaturas cursadas
    const prereqViolation = checkMissingPrerequisites(history, primarySubjects, lastCompletionPeriod);
    if (prereqViolation) {
        discrepancies.push(prereqViolation);
        // Si hay violación de prerequisitos, el estudiante no debería haber podido cursar esas materias
        // Esto indica un error en el sistema o en el historial
    }

    if(discrepancies.length > 0){
        const groupedDiscrepancies = groupDiscrepancies(discrepancies);
        return groupedDiscrepancies;
    }
    

    // 1. Check if curriculum is already completed
    if (isCurriculumCompleted(subjectsMap, completedSubjects, completedOptatives, completedElectives)) {
        return [{
            type: "Observacion",
            description: "El plan de estudios fue completado a tiempo.",
            severity: "Info"
        }];
    }

    // 2. Check if student can still finish on time
    const currentPeriod = getCurrentNormalizedPeriod(history, yearMap);
    const canFinish = canCompleteOnTime(
        subjectsMap,
        completedSubjects,
        completedOptatives,
        completedElectives,
        currentPeriod
    );

    if (canFinish) {
        return [{
            type: "Observacion",
            description: "El estudiante puede completar el plan a tiempo.",
            severity: "Info"
        }];
    }

    // 3. Not on time -> find discrepancies
    const maxPeriodToCheck = Math.max(currentPeriod, 15);
    const reportedEmptyPeriods = new Set<number>();

    for (let absPeriod = 1; absPeriod <= maxPeriodToCheck; absPeriod++) {
        if (absPeriod > currentPeriod) continue;
        
        const subjectsInPeriod = periodToSubjects.get(absPeriod);
        const count = subjectsInPeriod ? subjectsInPeriod.size : 0;
        const { year, period: periodNum } = toYearAndPeriod(absPeriod);

        if (count === 0) {
            if (!reportedEmptyPeriods.has(absPeriod)) {
                reportedEmptyPeriods.add(absPeriod);
                discrepancies.push({
                    type: "Periodo sin matricula",
                    description: `No se matricularon asignaturas en el año ${year}, periodo ${periodNum}.`,
                    severity: "Media"
                });
            }
        } else if (count < 4 && count > 0) {
            discrepancies.push({
                type: "Baja carga académica",
                description: `En el año ${year}, periodo ${periodNum} solo se matricularon ${count} asignatura(s), menos del mínimo recomendado (4).`,
                severity: "Media"
            });
        }
    }

    // Check for delays caused by failing prerequisites
    for (const [subjectCode, completionPeriod] of lastCompletionPeriod.entries()) {
        const subject = subjectsMap.get(subjectCode);
        if (!subject || subject.isElective) continue;

        const ideal = subject.idealPeriod;
        if (completionPeriod > ideal) {
            let delayedPrereq = false;
            let prereqName = "";
            
            if (subject.prerequisites && subject.prerequisites.length > 0) {
                for (const prereq of subject.prerequisites) {
                    const prereqCompletion = lastCompletionPeriod.get(prereq.subjectCode);
                    if (prereqCompletion && prereqCompletion > ideal) {
                        delayedPrereq = true;
                        prereqName = prereq.subjectName;
                        break;
                    }
                }
            }
            
            if (delayedPrereq) {
                discrepancies.push({
                    type: "Retraso",
                    description: `Retraso en la asignatura "${subject.subjectName}" debido a que su requisito "${prereqName}" fue cursado tarde.`,
                    severity: "Alta"
                });
            } else {
                discrepancies.push({
                    type: "Retraso",
                    description: `Retraso en la asignatura "${subject.subjectName}": cursada en periodo ${completionPeriod} cuando su periodo ideal era ${ideal}.`,
                    severity: "Media"
                });
            }
        }
    }

    // Check for pending subjects that are already late
    for (const subject of primarySubjects) {
        if (completedSubjects.has(subject.subjectCode)) continue;
        if (subject.isElective) continue;
        
        const ideal = subject.idealPeriod;
        if (ideal <= currentPeriod) {
            discrepancies.push({
                type: "Retraso",
                description: `La asignatura "${subject.subjectName}" (periodo ideal ${ideal}) aún no ha sido cursada y ya se encuentra atrasada.`,
                severity: "Alta"
            });
        }
    }

    // Group similar discrepancies
    const groupedDiscrepancies = groupDiscrepancies(discrepancies);
    
    return groupedDiscrepancies;
}