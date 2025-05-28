package pe.edu.vallegrande.grade_record_service.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import pe.edu.vallegrande.grade_record_service.model.ClassroomGradeRecord;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ClassroomGradeRecordRepository extends ReactiveMongoRepository<ClassroomGradeRecord, String> {
    Flux<ClassroomGradeRecord> findByClassroomIdAndPeriodId(Integer classroomId, Integer periodId);
    Mono<Boolean> existsByClassroomIdAndPeriodId(Integer classroomId, Integer periodId);
}
