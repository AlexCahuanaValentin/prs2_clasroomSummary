package pe.edu.vallegrande.vg_ms_grade_management.application.service;

import pe.edu.vallegrande.vg_ms_grade_management.domain.model.GradeManagementLog;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interfaz para el servicio de gestión de logs de calificaciones.
 */
public interface GradeManagementLogService {

    Mono<GradeManagementLog> save(GradeManagementLog gradeManagementLog);

    Flux<GradeManagementLog> getAll();

    Mono<GradeManagementLog> getById(String id);

    Flux<GradeManagementLog> getByStudentId(Long studentId);

    Flux<GradeManagementLog> getByGradeId(Long gradeId);

    Flux<GradeManagementLog> getByPeriodId(Long periodId);

    Flux<GradeManagementLog> getByTeacherCoursesClassroom(Long teacherCoursesClassroom);

    Flux<GradeManagementLog> getByClassroomAndPeriod(Long classroomId, Long periodId);

    Mono<Void> delete(String id);
}
