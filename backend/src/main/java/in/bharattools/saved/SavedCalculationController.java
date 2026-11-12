package in.bharattools.saved;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/saved-calculations")
public class SavedCalculationController {
  private final JdbcTemplate jdbc;
  private final ObjectMapper mapper;

  public SavedCalculationController(JdbcTemplate jdbc, ObjectMapper mapper) {
    this.jdbc = jdbc;
    this.mapper = mapper;
  }

  public record SaveRequest(
      @NotBlank @Size(max = 100) String toolSlug,
      @NotBlank @Size(max = 160) String title,
      Map<String, Object> inputs,
      Map<String, Object> result) {}

  @GetMapping
  public List<Map<String, Object>> list(Authentication auth) {
    UUID user = (UUID) auth.getPrincipal();
    return jdbc.query(
        "select id,tool_slug,title,input_data::text,result_data::text,created_at,updated_at from saved_calculation where user_id=? order by created_at desc",
        (rs, n) -> {
          Map<String, Object> row = new LinkedHashMap<>();
          row.put("id", rs.getObject("id", UUID.class));
          row.put("toolSlug", rs.getString("tool_slug"));
          row.put("title", rs.getString("title"));
          row.put("inputs", read(rs.getString("input_data")));
          row.put("result", read(rs.getString("result_data")));
          row.put("createdAt", rs.getTimestamp("created_at").toInstant());
          row.put("updatedAt", rs.getTimestamp("updated_at").toInstant());
          return row;
        },
        user);
  }

  @PostMapping
  public Map<String, Object> create(@Valid @RequestBody SaveRequest req, Authentication auth) {
    if (req.inputs() == null || req.result() == null)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inputs and result are required");
    if (!Set.of("gst", "emi", "percentage").contains(req.toolSlug()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported calculator");
    if (req.inputs().toString().length() > 12000 || req.result().toString().length() > 12000)
      throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Calculation is too large");
    UUID id = UUID.randomUUID();
    jdbc.update(
        "insert into saved_calculation(id,user_id,tool_slug,title,input_data,result_data) values(?,?,?,?,?::jsonb,?::jsonb)",
        id,
        (UUID) auth.getPrincipal(),
        req.toolSlug(),
        req.title().trim(),
        write(req.inputs()),
        write(req.result()));
    return Map.of("id", id, "message", "Calculation saved");
  }

  @PatchMapping("/{id}")
  public Map<String, String> rename(
      @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
    String title = body.getOrDefault("title", "").trim();
    if (title.isBlank() || title.length() > 160)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 1–160 characters");
    int changed =
        jdbc.update(
            "update saved_calculation set title=?,updated_at=now() where id=? and user_id=?",
            title,
            id,
            (UUID) auth.getPrincipal());
    if (changed == 0)
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved calculation not found");
    return Map.of("message", "Name updated");
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id, Authentication auth) {
    int changed =
        jdbc.update(
            "delete from saved_calculation where id=? and user_id=?",
            id,
            (UUID) auth.getPrincipal());
    if (changed == 0)
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved calculation not found");
  }

  private String write(Object value) {
    try {
      return mapper.writeValueAsString(value);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid calculation data");
    }
  }

  private Object read(String value) {
    try {
      return mapper.readValue(value, Object.class);
    } catch (Exception e) {
      return Map.of();
    }
  }
}
