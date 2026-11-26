package dev.geeks.studentmanagement.student;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class StudentChanges {
  record Changed() {}

  private final String instance = UUID.randomUUID().toString();
  private final AtomicLong revision = new AtomicLong();
  private final Set<SseEmitter> subscribers = ConcurrentHashMap.newKeySet();

  public String version() {
    return instance + ":" + revision.get();
  }

  public SseEmitter subscribe() {
    var emitter = new SseEmitter(60_000L);
    emitter.onCompletion(() -> subscribers.remove(emitter));
    emitter.onError(error -> subscribers.remove(emitter));
    emitter.onTimeout(emitter::complete);
    subscribers.add(emitter);
    sendVersion(emitter);
    return emitter;
  }

  @TransactionalEventListener
  public void afterCommit(Changed event) {
    revision.incrementAndGet();
    broadcastVersion();
  }

  @Scheduled(fixedDelay = 15_000)
  public void broadcastVersion() {
    subscribers.forEach(this::sendVersion);
  }

  private void sendVersion(SseEmitter emitter) {
    synchronized (emitter) {
      try {
        emitter.send(
            SseEmitter.event().name("students-version").reconnectTime(2000).data(version()));
      } catch (IOException | IllegalStateException disconnected) {
        subscribers.remove(emitter);
      }
    }
  }
}
