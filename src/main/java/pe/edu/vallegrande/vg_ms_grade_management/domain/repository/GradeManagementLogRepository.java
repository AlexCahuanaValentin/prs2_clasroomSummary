package pe.edu.vallegrande.vg_ms_grade_management.domain.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import pe.edu.vallegrande.vg_ms_grade_management.domain.model.GradeManagementLog;
import reactor.core.publisher.Flux;

/**
 * Repositorio Reactivo para acceder a los logs de gestión de calificaciones en MongoDB.
 */
public interface GradeManagementLogRepository extends ReactiveMongoRepository<GradeManagementLog, String> {

    /**
     * Obtiene todos los logs de calificaciones de un estudiante específico.
     * @param studentId ID del estudiante.
     * @return Flux con los registros encontrados.
     */
    Flux<GradeManagementLog> findByStudentId(Long studentId);

    /**
     * Obtiene todos los logs para una calificación específica.
     * @param gradeId ID de la calificación.
     * @return Flux con los registros encontrados.
     */
    Flux<GradeManagementLog> findByGradeId(Long gradeId);

    /**
     * Obtiene todos los logs correspondientes a un período académico.
     * @param periodId ID del período.
     * @return Flux con los registros encontrados.
     */
    Flux<GradeManagementLog> findByPeriodId(Long periodId);

    /**
     * Obtiene todos los logs de una combinación profesor-curso-aula.
     * @param teacherCoursesClassroom ID de la relación profesor/curso/aula.
     * @return Flux con los registros encontrados.
     */
    Flux<GradeManagementLog> findByTeacherCoursesClassroom(Long teacherCoursesClassroom);

    Flux<GradeManagementLog> findByPeriodIdAndTeacherCoursesClassroom(Long periodId, Long teacherCoursesClassroom);

}
