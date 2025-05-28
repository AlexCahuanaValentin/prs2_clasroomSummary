package pe.edu.vallegrande.grade_record_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeSummaryRequestDto {
    private Integer classroomId;
    private Integer periodId;
    private String createdBy;
    private String observation;
    private List<StudentGradeDto> students;
}
