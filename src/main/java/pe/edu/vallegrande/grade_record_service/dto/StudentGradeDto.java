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
public class StudentGradeDto {
    private Integer studentId;
    private Double finalGrade;
    private List<CompetencyGradeDto> competencies;
}
