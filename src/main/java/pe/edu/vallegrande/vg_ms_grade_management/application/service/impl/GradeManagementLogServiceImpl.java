package pe.edu.vallegrande.vg_ms_grade_management.application.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.vallegrande.vg_ms_grade_management.application.service.GradeManagementLogService;
import pe.edu.vallegrande.vg_ms_grade_management.domain.model.GradeManagementLog;
import pe.edu.vallegrande.vg_ms_grade_management.domain.repository.GradeManagementLogRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implementación del servicio para la gestión de logs de calificaciones.
 */
@Service
@RequiredArgsConstructor
public class GradeManagementLogServiceImpl implements GradeManagementLogService {

    private final GradeManagementLogRepository repository;

    @Override
    public Mono<GradeManagementLog> save(GradeManagementLog log) {
        return repository.save(log);
    }

    @Override
    public Flux<GradeManagementLog> getAll() {
        return repository.findAll();
    }

    @Override
    public Mono<GradeManagementLog> getById(String id) {
        return repository.findById(id);
    }

    @Override
    public Flux<GradeManagementLog> getByStudentId(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    @Override
    public Flux<GradeManagementLog> getByGradeId(Long gradeId) {
        return repository.findByGradeId(gradeId);
    }

    @Override
    public Flux<GradeManagementLog> getByPeriodId(Long periodId) {
        return repository.findByPeriodId(periodId);
    }

    @Override
    public Flux<GradeManagementLog> getByTeacherCoursesClassroom(Long teacherCoursesClassroom) {
        return repository.findByTeacherCoursesClassroom(teacherCoursesClassroom);
    }

    @Override
    public Mono<Void> delete(String id) {
        return repository.deleteById(id);
    }

    @Override
    public Flux<GradeManagementLog> getByClassroomAndPeriod(Long classroomId, Long periodId) {
        return repository.findByPeriodIdAndTeacherCoursesClassroom(periodId, classroomId);
    }

}
