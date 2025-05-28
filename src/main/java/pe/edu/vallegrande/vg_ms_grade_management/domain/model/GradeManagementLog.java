package pe.edu.vallegrande.vg_ms_grade_management.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "student_grades")
public class GradeManagementLog {

    @Id
    private String id;

    private Long gradeId;
    private Long studentId;
    private Long teacherCoursesClassroom;
    private Long periodId;
    private String actionType;
    private ModifiedData modifiedData;
    private String changeReason;
    private Long modifiedBy;
    private LocalDateTime modifiedAt = LocalDateTime.now();
}
