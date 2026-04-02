export interface StudentData {
    accountNumber : string,
    enrollmentDate : Date,
    currentPeriod : number,
    careers: string[]
}

export interface EmployeeData {
    employeeCode : string,
    department: string,
    position : string,
    hireDate : Date
}
export interface RegisterUserProp {
    name: string,
    email: string, 
    password: string,
    idRole: number,
    studentData? : StudentData,
    employeeData? : EmployeeData,
}