export interface ParsedSubject {
    subjectCode: string,
    subjectName?: string,
    period: number, 
    year: string
}

export interface CareerComparationProp{
    idStudentCareer: number,
    history : ParsedSubject[]
}