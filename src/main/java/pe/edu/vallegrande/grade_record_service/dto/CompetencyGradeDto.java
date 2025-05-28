package pe.edu.vallegrande.grade_record_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetencyGradeDto {
    private String name;
    private Double grade;
}
