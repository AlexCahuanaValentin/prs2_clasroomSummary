// src/types/classroomSummaryTypes.ts

export interface GradeSummary {
    totalStudents: number;
    averageGrade: number;
    topPerformance: number;
    lowestPerformance: number;
}

export interface CompetencyAnalysis {
    name: string;
    classroomAverage: number;
}

export interface CompetencyStats {
    competencyAnalysis: CompetencyAnalysis[];
    improvementAreas: string[];
}

export interface ClassroomGradeRecord {
    id: string;
    classroomId: number;
    periodId: number;
    createdBy: string;
    observation: string;
    status: 'A' | 'I';
    createdAt: string;
    gradeSummary: GradeSummary;
    competencyStats: CompetencyStats;
}
