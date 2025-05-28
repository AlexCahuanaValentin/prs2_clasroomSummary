package pe.edu.vallegrande.grade_record_service.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeSummary {
    private Integer totalStudents;
    private Double averageGrade;
    private Double topPerformance;
    private Double lowestPerformance;
}
