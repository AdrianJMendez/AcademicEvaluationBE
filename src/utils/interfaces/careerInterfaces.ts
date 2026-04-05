export interface ParsedSubject {
    subjectCode: string,
    subjectName?: string,
    period: number, 
    year: number,
    credits: number,
    score: number
}

export interface CareerComparationProp{
    idStudentCareer: number,
    history : ParsedSubject[]
}

export interface Prerequisite {
    idSubject: number;
    subjectCode: string;
    subjectName: string;
}

export interface PrimarySubject {
    idSubject: number;
    subjectCode: string;
    subjectName: string;
    idealPeriod: number;        // 1..15 (3 periods per year, 5 years)
    isOptative: boolean;
    isElective: boolean;
    prerequisites?: Prerequisite[];
}

export interface DiscrepancyProp {
    type: string;               // "observacion", "retraso", "periodo sin matricula"
    description: string;
    severity: string;           // e.g., "info", "media", "alta"
}
