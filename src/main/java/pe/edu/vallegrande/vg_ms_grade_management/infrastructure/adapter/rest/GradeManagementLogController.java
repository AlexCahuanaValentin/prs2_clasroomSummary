package pe.edu.vallegrande.vg_ms_grade_management.infrastructure.adapter.rest;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.vallegrande.vg_ms_grade_management.application.service.GradeManagementLogService;
import pe.edu.vallegrande.vg_ms_grade_management.domain.model.GradeManagementLog;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controlador REST para la gestión de logs de calificaciones.
 */
@RestController
@RequestMapping("/api/grade-logs")
@RequiredArgsConstructor
public class GradeManagementLogController {

    private final GradeManagementLogService gradeManagementLogService;

    /**
     * Crea un nuevo log de calificación.
     */
    @PostMapping
    public Mono<ResponseEntity<GradeManagementLog>> createLog(@RequestBody GradeManagementLog gradeManagementLog) {
        return gradeManagementLogService.save(gradeManagementLog)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    /**
     * Lista todos los logs.
     */
    @GetMapping
    public Flux<GradeManagementLog> getAllLogs() {
        return gradeManagementLogService.getAll()
                .doOnNext(log -> System.out.println("Log: " + log)) // Log para depuración
                .switchIfEmpty(Flux.error(new RuntimeException("No logs found"))); // Manejo si no hay logs
    }

    /**
     * Obtiene un log por su ID.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<GradeManagementLog>> getLogById(@PathVariable String id) {
        if (!ObjectId.isValid(id)) {
            return Mono.just(ResponseEntity.badRequest().build());
        }
        return gradeManagementLogService.getById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Lista logs por ID del estudiante.
     */
    @GetMapping("/student/{studentId}")
    public Flux<GradeManagementLog> getByStudentId(@PathVariable Long studentId) {
        return gradeManagementLogService.getByStudentId(studentId);
    }

    /**
     * Lista logs por ID de calificación.
     */
    @GetMapping("/grade/{gradeId}")
    public Flux<GradeManagementLog> getByGradeId(@PathVariable Long gradeId) {
        return gradeManagementLogService.getByGradeId(gradeId);
    }

    /**
     * Lista logs por ID de período académico.
     */
    @GetMapping("/period/{periodId}")
    public Flux<GradeManagementLog> getByPeriodId(@PathVariable Long periodId) {
        return gradeManagementLogService.getByPeriodId(periodId);
    }

    /**
     * Lista logs por combinación profesor-curso-aula.
     */
    @GetMapping("/teacher-course-classroom/{teacherCoursesClassroom}")
    public Flux<GradeManagementLog> getByTeacherCoursesClassroom(@PathVariable Long teacherCoursesClassroom) {
        return gradeManagementLogService.getByTeacherCoursesClassroom(teacherCoursesClassroom);
    }

    /**
     * Elimina un registro de log de calificación por su ID.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteLog(@PathVariable String id) {
        return gradeManagementLogService.getById(id)
                .flatMap(existingLog ->
                        gradeManagementLogService.delete(id)
                                .then(Mono.just(new ResponseEntity<Void>(HttpStatus.NO_CONTENT)))
                )
                .defaultIfEmpty(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/classroom-period")
    public Flux<GradeManagementLog> getByClassroomAndPeriod(@RequestParam Long classroomId,
                                                            @RequestParam Long periodId) {
        return gradeManagementLogService.getByClassroomAndPeriod(classroomId, periodId);
    }

}
