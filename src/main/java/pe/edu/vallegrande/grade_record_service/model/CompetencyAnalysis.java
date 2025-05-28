package pe.edu.vallegrande.grade_record_service.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetencyAnalysis {
    private String name;
    private Double classroomAverage;
}
