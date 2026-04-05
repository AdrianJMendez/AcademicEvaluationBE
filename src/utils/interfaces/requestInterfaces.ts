export interface ImageUploadData {
    base64Image: string;
}
export interface DiscrepancyProp{
    idSubject?: number,
    idDiscrepancyType: number, 
    expectedPeriod?: number,
    actualPeriod?: number,
    description?: string,
    severity?: string,
    justification : JustificactionProp;
};

export interface DiscrepancyRegisterProp{
    type: string,
    description: string,
    severity: string
}
export interface JustificactionProp {
    discrepancyProps: number[],
    title: string,
    description: string,
}

export interface RequestRegisterProp {
    idStudentCareer: number,
    discrepancies: DiscrepancyRegisterProp[],
    justifications?: JustificactionProp[],
    images?: ImageUploadData[]
}