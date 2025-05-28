package pe.edu.vallegrande.grade_record_service.dto;

import lombok.*;
import pe.edu.vallegrande.grade_record_service.model.CompetencyStats;
import pe.edu.vallegrande.grade_record_service.model.GradeSummary;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomGradeRecordDto {

    private Integer classroomId;
    private Integer periodId;
    private GradeSummary gradeSummary;
    private CompetencyStats competencyStats;
    private String createdBy;
    private String status;
    private String observation;
}
