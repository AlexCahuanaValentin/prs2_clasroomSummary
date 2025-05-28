package pe.edu.vallegrande.grade_record_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.vallegrande.grade_record_service.dto.GradeSummaryRequestDto;
import pe.edu.vallegrande.grade_record_service.model.ClassroomGradeRecord;
import pe.edu.vallegrande.grade_record_service.service.ClassroomGradeRecordService;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/classroom-grade-records")
@RequiredArgsConstructor
public class ClassroomGradeRecordController {

    private final ClassroomGradeRecordService service;

    /**
     * Crear resumen de aula a partir de datos del microservicio de logs.
     */
    @PostMapping("/generate")
    public Mono<ClassroomGradeRecord> generateSummary(@RequestBody GradeSummaryRequestDto dto) {
        return service.generateSummary(dto);
    }

    /**
     * VERIFICA SI HAY DUPLICIDAD.
     */
    @GetMapping("/check-duplicate")
    public Mono<ResponseEntity<Boolean>> checkDuplicate(
            @RequestParam Integer classroomId,
            @RequestParam Integer periodId
    ) {
        return service.existsByClassroomAndPeriod(classroomId, periodId)
                .map(ResponseEntity::ok);
    }

    /**
     * EDITA UN RESUMEN
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<ClassroomGradeRecord>> update(
            @PathVariable String id,
            @RequestBody ClassroomGradeRecord updatedData) {
        return service.update(id, updatedData)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    if (e instanceof IllegalStateException) {
                        return Mono.just(ResponseEntity.badRequest().body(
                                ClassroomGradeRecord.builder().observation(e.getMessage()).build()
                        ));
                    }
                    return Mono.just(ResponseEntity.notFound().build());
                });
    }

    /**
     * LISTA TODO
     */
    @GetMapping
    public Mono<ResponseEntity<List<ClassroomGradeRecord>>> findAll() {
        return service.findAll().map(ResponseEntity::ok);
    }

    /**
     * FILTRO POR ID
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ClassroomGradeRecord>> findById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * FILTRO POR ESTADO, AULA y PERIODO
     */
    @GetMapping("/search")
    public Mono<ResponseEntity<List<ClassroomGradeRecord>>> findByFilters(
            @RequestParam(required = false) Integer classroomId,
            @RequestParam(required = false) Integer periodId,
            @RequestParam(required = false) String status
    ) {
        return service.findByFilters(classroomId, periodId, status)
                .map(ResponseEntity::ok);
    }

    // ELIMINADO LÓGICO
    @PutMapping("/disable/{id}")
    public Mono<ResponseEntity<ClassroomGradeRecord>> disable(@PathVariable String id) {
        return service.disable(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    // RESTAURAR
    @PutMapping("/restore/{id}")
    public Mono<ResponseEntity<ClassroomGradeRecord>> restore(@PathVariable String id) {
        return service.restore(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    // ELIMINADO FÍSICO
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable String id) {
        return service.delete(id)
                .thenReturn(ResponseEntity.noContent().<Void>build())
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }
}
