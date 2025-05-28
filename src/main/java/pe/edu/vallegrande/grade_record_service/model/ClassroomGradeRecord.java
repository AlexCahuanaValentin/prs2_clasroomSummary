package pe.edu.vallegrande.grade_record_service.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "classroom_grade_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomGradeRecord {

    @Id
    private String id;

    private Integer classroomId;
    private Integer periodId;
    private GradeSummary gradeSummary;
    private CompetencyStats competencyStats;
    private String createdBy;
    private Date createdAt;
    private String status;
    private String observation;
}
