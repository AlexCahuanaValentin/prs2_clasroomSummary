package pe.edu.vallegrande.grade_record_service.model;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetencyStats {
    private List<CompetencyAnalysis> competencyAnalysis;
    private List<String> improvementAreas;
}

