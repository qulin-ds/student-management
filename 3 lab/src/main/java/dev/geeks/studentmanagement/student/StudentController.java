package dev.geeks.studentmanagement.student;

import dev.geeks.studentmanagement.student.dto.*;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class StudentController {
  private final StudentService service;
  private final StudentChanges changes;

  public StudentController(StudentService service, StudentChanges changes) {
    this.service = service;
    this.changes = changes;
  }

  @GetMapping(value = "/api/user/students/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<SseEmitter> events() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .header("X-Accel-Buffering", "no")
        .body(changes.subscribe());
  }

  @GetMapping("/api/user/students/version")
  public ResponseEntity<Map<String, String>> version() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(Map.of("version", changes.version()));
  }

  @PostMapping("/api/user/students/search")
  public PageResponse<StudentDto> search(@RequestBody StudentSearchRequest r) {
    return service.list(r);
  }

  @GetMapping("/api/user/students")
  public PageResponse<StudentDto> getStudents(
      @ModelAttribute StudentSearchRequest r,
      @RequestParam(name = "is_foreign", required = false) Boolean foreign) {
    return service.list(
        new StudentSearchRequest(
            r.ISU(),
            r.name(),
            r.group(),
            r.dormitory(),
            r.room(),
            foreign == null ? r.isForeign() : foreign,
            r.checkinDate(),
            r.note(),
            r.sort(),
            r.page(),
            r.size()));
  }

  @GetMapping("/api/user/students/{isu}")
  public Map<String, StudentDto> getStudent(@PathVariable Integer isu) {
    return Map.of("data", service.getByIsu(isu));
  }

  @PostMapping("/api/admin/students")
  public ResponseEntity<Map<String, StudentDto>> createStudent(
      @Valid @RequestBody StudentCreateRequest r) {
    return ResponseEntity.status(201).body(Map.of("data", service.create(r)));
  }

  @DeleteMapping("/api/admin/students/{isu}")
  public ResponseEntity<Void> deleteStudent(@PathVariable Integer isu) {
    service.delete(isu);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/api/admin/students/{isu}")
  public Map<String, StudentDto> replaceStudent(
      @PathVariable Integer isu, @Valid @RequestBody StudentCreateRequest r) {
    return Map.of("data", service.replace(isu, r));
  }

  @PatchMapping("/api/admin/students/{isu}")
  public Map<String, StudentDto> patchStudent(
      @PathVariable Integer isu, @RequestBody StudentUpdateRequest r) {
    return Map.of("data", service.patch(isu, r));
  }
}
