package in.bharattools.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationHours;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-hours:12}") long expirationHours) {
    if (secret.getBytes(StandardCharsets.UTF_8).length < 32)
      throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationHours = expirationHours;
  }

  public String issue(UUID userId, String email) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(userId.toString())
        .claim("email", email)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(expirationHours * 3600)))
        .signWith(key)
        .compact();
  }

  public UUID userId(String token) {
    return UUID.fromString(
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject());
  }
}
