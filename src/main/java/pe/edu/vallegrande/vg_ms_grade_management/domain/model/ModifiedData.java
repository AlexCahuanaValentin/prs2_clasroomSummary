package pe.edu.vallegrande.vg_ms_grade_management.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModifiedData {

    private Double previousGrade;
    private Double newGrade;
    private List<ModifiedField> modifiedFields;
    private ContextMetadata contextMetadata;
}
