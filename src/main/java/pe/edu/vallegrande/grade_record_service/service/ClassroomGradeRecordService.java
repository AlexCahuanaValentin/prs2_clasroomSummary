package pe.edu.vallegrande.grade_record_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pe.edu.vallegrande.grade_record_service.dto.GradeSummaryRequestDto;
import pe.edu.vallegrande.grade_record_service.dto.StudentGradeDto;
import pe.edu.vallegrande.grade_record_service.dto.CompetencyGradeDto;
import pe.edu.vallegrande.grade_record_service.model.*;
import pe.edu.vallegrande.grade_record_service.repository.ClassroomGradeRecordRepository;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ClassroomGradeRecordService {

    private final ClassroomGradeRecordRepository repository;
    private final WebClient webClient;

    // INSERTADO
    public Mono<ClassroomGradeRecord> generateSummary(GradeSummaryRequestDto dto) {
        return repository.existsByClassroomIdAndPeriodId(dto.getClassroomId(), dto.getPeriodId())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new IllegalStateException("Ya existe un resumen para este aula y periodo"));
                    }

                    return webClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/api/grade-logs/classroom-period")
                                    .queryParam("classroomId", dto.getClassroomId())
                                    .queryParam("periodId", dto.getPeriodId())
                                    .build())
                            .retrieve()
                            .bodyToFlux(JsonNode.class)
                            .collectList()
                            .flatMap(logs -> {
                                List<StudentGradeDto> students = logs.stream()
                                        .collect(Collectors.groupingBy(
                                                log -> log.get("studentId").asInt(),
                                                Collectors.mapping(log -> {
                                                    double grade = log.get("modifiedData").get("newGrade").asDouble();
                                                    String component = log.get("modifiedData").get("contextMetadata").get("curricularComponent").asText();
                                                    return new CompetencyGradeDto(component, grade);
                                                }, Collectors.toList())
                                        ))
                                        .entrySet().stream()
                                        .map(entry -> StudentGradeDto.builder()
                                                .studentId(entry.getKey())
                                                .finalGrade(
                                                        redondear(entry.getValue().stream()
                                                                .mapToDouble(CompetencyGradeDto::getGrade).average().orElse(0.0)))
                                                .competencies(entry.getValue())
                                                .build())
                                        .collect(Collectors.toList());

                                return processAndSave(dto, students);
                            });
                });
    }

    private Mono<ClassroomGradeRecord> processAndSave(GradeSummaryRequestDto dto, List<StudentGradeDto> students) {
        if (students.isEmpty()) return Mono.error(new IllegalArgumentException("No hay datos para insertar"));

        int totalStudents = students.size();
        double average = redondear(students.stream().mapToDouble(StudentGradeDto::getFinalGrade).average().orElse(0.0));
        double max = redondear(students.stream().mapToDouble(StudentGradeDto::getFinalGrade).max().orElse(0.0));
        double min = redondear(students.stream().mapToDouble(StudentGradeDto::getFinalGrade).min().orElse(0.0));

        Map<String, List<Double>> compMap = new HashMap<>();
        for (StudentGradeDto student : students) {
            for (CompetencyGradeDto comp : student.getCompetencies()) {
                compMap.computeIfAbsent(comp.getName(), k -> new ArrayList<>()).add(comp.getGrade());
            }
        }

        List<CompetencyAnalysis> analysis = compMap.entrySet().stream()
                .map(e -> new CompetencyAnalysis(e.getKey(), redondear(e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0))))
                .collect(Collectors.toList());

        List<String> improvementAreas = analysis.stream()
                .filter(a -> a.getClassroomAverage() < 13.0)
                .map(CompetencyAnalysis::getName)
                .collect(Collectors.toList());

        GradeSummary summary = new GradeSummary(totalStudents, average, max, min);
        CompetencyStats stats = new CompetencyStats(analysis, improvementAreas);

        ClassroomGradeRecord record = ClassroomGradeRecord.builder()
                .classroomId(dto.getClassroomId())
                .periodId(dto.getPeriodId())
                .gradeSummary(summary)
                .competencyStats(stats)
                .createdBy(dto.getCreatedBy())
                .createdAt(new Date())
                .status("A")
                .observation(dto.getObservation())
                .build();

        return repository.save(record);
    }

    private double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    // ACTUALIZAR DATOS
    public Mono<Boolean> existsDuplicate(Integer classroomId, Integer periodId, String excludeId) {
        return repository.findAll()
                .filter(r -> r.getClassroomId().equals(classroomId))
                .filter(r -> r.getPeriodId().equals(periodId))
                .filter(r -> !r.getId().equals(excludeId)) // excluye el mismo
                .hasElements();
    }

    public Mono<ClassroomGradeRecord> update(String id, ClassroomGradeRecord updatedData) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new NoSuchElementException("Resumen no encontrado")))
                .flatMap(existing -> {
                    boolean sameCombo =
                            Objects.equals(existing.getClassroomId(), updatedData.getClassroomId()) &&
                                    Objects.equals(existing.getPeriodId(), updatedData.getPeriodId());

                    if (sameCombo) {
                        // Solo actualizar algunos campos
                        existing.setCreatedBy(updatedData.getCreatedBy());
                        existing.setObservation(updatedData.getObservation());
                        return repository.save(existing);
                    }

                    // Si cambia el aula o periodo, validamos duplicado
                    return repository.existsByClassroomIdAndPeriodId(updatedData.getClassroomId(), updatedData.getPeriodId())
                            .flatMap(exists -> {
                                if (exists) {
                                    return Mono.error(new IllegalStateException("Ya existe un resumen con ese aula y periodo"));
                                }

                                // REGENERAMOS los datos
                                return webClient.get()
                                        .uri(uriBuilder -> uriBuilder
                                                .path("/api/grade-logs/classroom-period")
                                                .queryParam("classroomId", updatedData.getClassroomId())
                                                .queryParam("periodId", updatedData.getPeriodId())
                                                .build())
                                        .retrieve()
                                        .bodyToFlux(JsonNode.class)
                                        .collectList()
                                        .flatMap(logs -> {
                                            List<StudentGradeDto> students = logs.stream()
                                                    .collect(Collectors.groupingBy(
                                                            log -> log.get("studentId").asInt(),
                                                            Collectors.mapping(log -> {
                                                                double grade = log.get("modifiedData").get("newGrade").asDouble();
                                                                String component = log.get("modifiedData").get("contextMetadata").get("curricularComponent").asText();
                                                                return new CompetencyGradeDto(component, grade);
                                                            }, Collectors.toList())
                                                    ))
                                                    .entrySet().stream()
                                                    .map(entry -> StudentGradeDto.builder()
                                                            .studentId(entry.getKey())
                                                            .finalGrade(
                                                                    redondear(entry.getValue().stream()
                                                                            .mapToDouble(CompetencyGradeDto::getGrade).average().orElse(0.0)))
                                                            .competencies(entry.getValue())
                                                            .build())
                                                    .collect(Collectors.toList());

                                            if (students.isEmpty()) {
                                                return Mono.error(new IllegalArgumentException("No hay registros para ese aula y periodo"));
                                            }

                                            // Proceso de resumen
                                            int total = students.size();
                                            double avg = redondear(students.stream().mapToDouble(StudentGradeDto::getFinalGrade).average().orElse(0.0));
                                            double max = redondear(students.stream().mapToDouble(StudentGradeDto::getFinalGrade).max().orElse(0.0));
                                            double min = redondear(students.stream().mapToDouble(StudentGradeDto::getFinalGrade).min().orElse(0.0));

                                            Map<String, List<Double>> compMap = new HashMap<>();
                                            for (StudentGradeDto student : students) {
                                                for (CompetencyGradeDto comp : student.getCompetencies()) {
                                                    compMap.computeIfAbsent(comp.getName(), k -> new ArrayList<>()).add(comp.getGrade());
                                                }
                                            }

                                            List<CompetencyAnalysis> analysis = compMap.entrySet().stream()
                                                    .map(e -> new CompetencyAnalysis(e.getKey(), redondear(e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0))))
                                                    .collect(Collectors.toList());

                                            List<String> areas = analysis.stream()
                                                    .filter(a -> a.getClassroomAverage() < 13.0)
                                                    .map(CompetencyAnalysis::getName)
                                                    .collect(Collectors.toList());

                                            GradeSummary summary = new GradeSummary(total, avg, max, min);
                                            CompetencyStats stats = new CompetencyStats(analysis, areas);

                                            existing.setClassroomId(updatedData.getClassroomId());
                                            existing.setPeriodId(updatedData.getPeriodId());
                                            existing.setCreatedBy(updatedData.getCreatedBy());
                                            existing.setObservation(updatedData.getObservation());
                                            existing.setGradeSummary(summary);
                                            existing.setCompetencyStats(stats);
                                            existing.setCreatedAt(new Date()); // opcional

                                            return repository.save(existing);
                                        });
                            });
                });
    }

    // FILTRO POR ID
    public Mono<ClassroomGradeRecord> findById(String id) {
        return repository.findById(id);
    }

    // VERIFICA SI HAY DUPLICIDAD
    public Mono<Boolean> existsByClassroomAndPeriod(Integer classroomId, Integer periodId) {
        return repository.existsByClassroomIdAndPeriodId(classroomId, periodId);
    }

    //LISTA TODA LA LISTA
    public Mono<List<ClassroomGradeRecord>> findAll() {
        return repository.findAll()
                .sort(Comparator.comparing(ClassroomGradeRecord::getCreatedAt).reversed())
                .collectList();
    }

    // LISTA CON FILTROS(ESTADO, AULA y PERIODO)
    public Mono<List<ClassroomGradeRecord>> findByFilters(Integer classroomId, Integer periodId, String status) {
        return repository.findAll()
                .filter(r -> classroomId == null || r.getClassroomId().equals(classroomId))
                .filter(r -> periodId == null || r.getPeriodId().equals(periodId))
                .filter(r -> status == null || r.getStatus().equalsIgnoreCase(status))
                .sort(Comparator.comparing(ClassroomGradeRecord::getCreatedAt).reversed())
                .collectList();
    }

    public Mono<ClassroomGradeRecord> disable(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new NoSuchElementException("Resumen no encontrado")))
                .flatMap(record -> {
                    record.setStatus("I");
                    return repository.save(record);
                });
    }

    public Mono<ClassroomGradeRecord> restore(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new NoSuchElementException("Resumen no encontrado")))
                .flatMap(record -> {
                    record.setStatus("A");
                    return repository.save(record);
                });
    }

    public Mono<Void> delete(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new NoSuchElementException("Resumen no encontrado")))
                .flatMap(repository::delete);
    }

}

