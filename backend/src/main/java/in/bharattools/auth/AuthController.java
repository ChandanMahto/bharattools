package in.bharattools.auth;

import in.bharattools.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final JdbcTemplate jdbc;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthController(JdbcTemplate jdbc, PasswordEncoder encoder, JwtService jwt) {
    this.jdbc = jdbc;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  public record Credentials(
      @Email @NotBlank @Size(max = 320) String email,
      @NotBlank @Size(min = 10, max = 72) String password) {}

  @PostMapping("/register")
  public Map<String, Object> register(@Valid @RequestBody Credentials body) {
    validatePasswordBytes(body.password());
    String email = body.email().trim().toLowerCase();
    if (jdbc.queryForObject("select count(*) from app_user where email=?", Integer.class, email)
        > 0)
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "An account with this email already exists");
    UUID id = UUID.randomUUID();
    jdbc.update(
        "insert into app_user(id,email,password_hash) values(?,?,?)",
        id,
        email,
        encoder.encode(body.password()));
    return Map.of("token", jwt.issue(id, email), "email", email);
  }

  private void validatePasswordBytes(String password) {
    if (password.getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Password must be no more than 72 UTF-8 bytes");
  }

  @PostMapping("/login")
  public Map<String, Object> login(@Valid @RequestBody Credentials body) {
    validatePasswordBytes(body.password());
    String email = body.email().trim().toLowerCase();
    var rows =
        jdbc.query(
            "select id,password_hash from app_user where email=?",
            (rs, n) ->
                Map.of("id", rs.getObject("id", UUID.class), "hash", rs.getString("password_hash")),
            email);
    if (rows.isEmpty() || !encoder.matches(body.password(), (String) rows.get(0).get("hash")))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect");
    return Map.of("token", jwt.issue((UUID) rows.get(0).get("id"), email), "email", email);
  }
}
