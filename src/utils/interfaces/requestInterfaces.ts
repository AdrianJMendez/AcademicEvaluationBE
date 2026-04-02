export interface DiscrepancyProp{
    idSubject?: number,
    idDiscrepancyType: number, 
    expectedPeriod?: number,
    actualPeriod?: number,
    description?: string,
    severity?: string,
    justification : JustificactionProp;
};

export interface JustificactionProp {
    title: string,
    description: string,
    impactLevel : string,
}

export interface RequestRegisterProp {
    idStudentCareer: number,
    discrepancies: DiscrepancyProp[],

}